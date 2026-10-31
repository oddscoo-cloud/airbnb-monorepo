import { Heart, Star } from 'lucide-react'
import type { Listing } from '../../types/listing'

type ListingCardProps = {
  listing: Listing
  taxIncluded: boolean
  isSaved?: boolean
  onOpenListing: (listing: Listing) => void
  onToggleSave?: (listingId: number) => void
}

export function ListingCard({ listing, taxIncluded, isSaved = false, onOpenListing, onToggleSave }: ListingCardProps) {
  // Клавиатурное управление карточкой и изоляция клика вложенной кнопки.
  return (
    <article
      className="listing-card"
      onClick={() => onOpenListing(listing)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenListing(listing)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Відкрити оголошення в ${listing.location}`}
    >
      <div className="listing-card__image-wrap">
        {/* Необязательное фото с отложенной загрузкой. */}
        {listing.image && <img
          className="listing-card__image"
          src={listing.image}
          alt={`Помешкання в ${listing.location}`}
          loading="lazy"
        />}
        <button
          type="button"
          className={`listing-card__like${isSaved ? ' listing-card__like--saved' : ''}`}
          aria-label={isSaved ? 'Видалити зі збережених' : 'Додати до збережених'}
          aria-pressed={isSaved}
          onClick={(event) => {
            event.stopPropagation()
            onToggleSave?.(Number(listing.id))
          }}
        >
          <Heart size={18} aria-hidden fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="listing-card__body">
        <div className="listing-card__row">
          <span className="listing-card__location">{listing.location}</span>
          <span className="listing-card__rating">
            {listing.rating !== null && <><Star size={13} fill="currentColor" aria-hidden />{listing.rating.toFixed(2)}</>}
          </span>
        </div>
        {listing.category && <p className="listing-card__meta">{listing.category}</p>}
        <p className="listing-card__price">
          <strong>${taxIncluded ? listing.price * 5 + 20 : listing.price},00</strong>{' '}
          {taxIncluded ? 'за 5 ночей' : 'за ніч'}
        </p>
      </div>
    </article>
  )
}
