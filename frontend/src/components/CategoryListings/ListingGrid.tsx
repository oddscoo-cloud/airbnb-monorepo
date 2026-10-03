import type { Listing } from '../../types/listing'
import { ListingCard } from './ListingCard'

type ListingGridProps = {
  listings: Listing[]
  isLoading: boolean
  error: string
  taxIncluded: boolean
  onOpenListing: (listing: Listing) => void
}

export function ListingGrid({ listings, isLoading, error, taxIncluded, onOpenListing }: ListingGridProps) {
  return (
    <div className="listings__grid">
      {/* Приоритет состояний: загрузка, ошибка, пустой список, карточки. */}
      {isLoading ? <p>Завантаження помешкань…</p> : error ? <p role="alert">{error}</p> : listings.length === 0 ? <p>За вибраними фільтрами помешкань не знайдено.</p> : listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          taxIncluded={taxIncluded}
          onOpenListing={onOpenListing}
        />
      ))}
    </div>
  )
}
