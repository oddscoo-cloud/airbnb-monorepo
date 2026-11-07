import { useState } from 'react'
import { ChevronLeft, Heart, Share } from 'lucide-react'
import type { Listing } from '../../types/listing'
import { useLanguage } from '../../i18n'
import './ListingGallery.css'

type ListingGalleryProps = {
  listing: Listing
  isSaved: boolean
  onToggleSave?: (listingId: number) => void
  onBack: () => void
}

export function ListingGallery({ listing, isSaved, onToggleSave, onBack }: ListingGalleryProps) {
  const { t } = useLanguage()
  const [shareMessage, setShareMessage] = useState('')

  async function shareListing() {
    setShareMessage('')
    const text = `${listing.title} — ${listing.location}`

    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, text })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setShareMessage(t('Інформацію про помешкання скопійовано'))
      } else {
        setShareMessage(t('Не вдалося поділитися інформацією про помешкання'))
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setShareMessage(t('Не вдалося поділитися інформацією про помешкання'))
    }
  }

  return (
    <div className="listing-gallery">
      <header className="listing-gallery__header">
        <button type="button" className="listing-gallery__back" onClick={onBack} aria-label={t('Повернутися до помешкання')}>
          <ChevronLeft size={22} aria-hidden />
        </button>
        <div className="listing-gallery__actions">
          <button type="button" onClick={() => void shareListing()}>
            <Share size={16} aria-hidden /> {t('Поділитися')}
          </button>
          <button
            type="button"
            className={isSaved ? 'listing-gallery__save--saved' : undefined}
            onClick={() => onToggleSave?.(Number(listing.id))}
            aria-pressed={isSaved}
          >
            <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} aria-hidden />
            {t(isSaved ? 'Збережено' : 'Зберегти')}
          </button>
        </div>
      </header>
      {shareMessage && <p className="listing-gallery__message" role="status">{shareMessage}</p>}
      <main className="listing-gallery__photos" aria-label={`${t('Фотографії:')}${listing.title}`}>
        {(listing.gallery ?? []).map((src, index) => (
          <img
            key={`${src}-${index}`}
            className={(index + 1) % 5 === 0 ? 'listing-gallery__photo listing-gallery__photo--wide' : 'listing-gallery__photo'}
            src={src}
            alt={`${listing.title}, ${t('фото')} ${index + 1}`}
            loading={index < 4 ? 'eager' : 'lazy'}
          />
        ))}
      </main>
    </div>
  )
}
