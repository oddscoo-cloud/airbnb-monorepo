import { useMemo, useState } from 'react'
import { useEffect } from 'react'
import { CategoryNavigation } from './CategoryNavigation'
import { CATEGORIES } from './categories'
import { ListingGrid } from './ListingGrid'
import type { Listing } from '../../types/listing'
import './CategoryListings.css'

interface CategoryListingsProps {
  listings: Listing[]
  isLoading: boolean
  error: string
  selectedRegion: string | null
  onSelectRegion: (region: string | null) => void
  onClearRegionFilter: () => void
  onOpenListing: (listing: Listing) => void
}

export function CategoryListings({
  listings,
  isLoading,
  error,
  selectedRegion,
  onSelectRegion,
  onClearRegionFilter,
  onOpenListing,
}: CategoryListingsProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [taxIncluded, setTaxIncluded] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minimumRating, setMinimumRating] = useState('')
  const [guests, setGuests] = useState('1')
  const [visibleCount, setVisibleCount] = useState(8)

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesCategory = activeCategory === 'all' || listing.category === CATEGORIES.find((category) => category.id === activeCategory)?.label
      const matchesRegion = !selectedRegion || listing.region.toLocaleLowerCase() === selectedRegion.toLocaleLowerCase()
      const matchesMinPrice = !minPrice || listing.price >= Number(minPrice)
      const matchesMaxPrice = !maxPrice || listing.price <= Number(maxPrice)
      const matchesRating = !minimumRating || (listing.rating !== null && listing.rating >= Number(minimumRating))
      const matchesGuests = listing.maxGuests >= Number(guests || 1)
      return matchesCategory && matchesRegion && matchesMinPrice && matchesMaxPrice && matchesRating && matchesGuests
    })
  }, [activeCategory, guests, listings, maxPrice, minPrice, minimumRating, selectedRegion])

  useEffect(() => {
    setVisibleCount(8)
  }, [activeCategory, guests, maxPrice, minPrice, minimumRating, selectedRegion])

  function clearFilters() {
    onClearRegionFilter()
    setActiveCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setMinimumRating('')
    setGuests('1')
  }
  const visibleListings = filteredListings.slice(0, visibleCount)

  const allRegions = [...new Set(listings.map((listing) => listing.region).filter(Boolean))]

  return (
    <section className="category-listings" aria-label="Категорії та помешкання">
      <CategoryNavigation
        activeCategory={activeCategory}
        onActiveCategoryChange={setActiveCategory}
        selectedRegion={selectedRegion}
        onSelectRegion={onSelectRegion}
        onClearFilters={clearFilters}
        allRegions={allRegions}
        taxIncluded={taxIncluded}
        onTaxIncludedChange={setTaxIncluded}
        minPrice={minPrice}
        onMinPriceChange={setMinPrice}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        minimumRating={minimumRating}
        onMinimumRatingChange={setMinimumRating}
        guests={guests}
        onGuestsChange={setGuests}
      />

      <ListingGrid
        listings={isLoading || error ? [] : visibleListings}
        isLoading={isLoading}
        error={error}
        taxIncluded={taxIncluded}
        onOpenListing={onOpenListing}
      />

      <div className="category-listings__continue">
        <h2>
          {selectedRegion
            ? `Продовжити огляд регіону «${selectedRegion}»`
            : `Продовжити огляд категорії «${CATEGORIES.find((c) => c.id === activeCategory)?.label}»`}
        </h2>
        {visibleCount < filteredListings.length && (
          <button
            type="button"
            className="category-listings__more"
            onClick={() => setVisibleCount((count) => count + 8)}
          >
            Показати більше
          </button>
        )}
      </div>
    </section>
  )
}
