import type { Listing } from '../../types/listing'
import { ListingCard } from './ListingCard'
import { useLanguage } from '../../i18n'

type ListingGridProps = {
  listings: Listing[]
  isLoading: boolean
  error: string
  taxIncluded: boolean
  savedIds?: Set<number>
  onOpenListing: (listing: Listing) => void
  onToggleSave?: (listingId: number) => void
}

export function ListingGrid({ listings, isLoading, error, taxIncluded, savedIds, onOpenListing, onToggleSave }: ListingGridProps) {
  const { t } = useLanguage()
  return (
    <div className="listings__grid">
      {/* Приоритет состояний: загрузка, ошибка, пустой список, карточки. */}
      {isLoading ? <p>{t('Завантаження помешкань…')}</p> : error ? <p role="alert">{error}</p> : listings.length === 0 ? <p>{t('За вибраними фільтрами помешкань не знайдено.')}</p> : listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          taxIncluded={taxIncluded}
          isSaved={savedIds?.has(Number(listing.id)) ?? false}
          onOpenListing={onOpenListing}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  )
}
