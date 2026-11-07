import { useState } from 'react'
import { useEffect } from 'react'
import type { ListingSearchFilters } from '../../api/listings'
import { CategoryNavigation } from './CategoryNavigation'
import { CATEGORIES } from './categories'
import { ListingGrid } from './ListingGrid'
import type { Listing } from '../../types/listing'
import { useLanguage } from '../../i18n'
import './CategoryListings.css'

interface CategoryListingsProps {
  listings: Listing[]
  isLoading: boolean
  error: string
  guestCount: number
  onGuestCountChange: (guestCount: number) => void
  searchFilters: ListingSearchFilters
  onSearchFiltersChange: (filters: Partial<ListingSearchFilters>) => void
  allRegions: string[]
  selectedRegion: string | null
  onSelectRegion: (region: string | null) => void
  onClearRegionFilter: () => void
  onOpenListing: (listing: Listing) => void
  savedIds?: Set<number>
  onToggleSave?: (listingId: number) => void
  expandAllRevision: number
  showAllListings?: boolean
}

export function CategoryListings({
  listings,
  isLoading,
  error,
  guestCount,
  onGuestCountChange,
  searchFilters,
  onSearchFiltersChange,
  allRegions,
  selectedRegion,
  onSelectRegion,
  onClearRegionFilter,
  onOpenListing,
  savedIds,
  onToggleSave,
  expandAllRevision,
  showAllListings = false,
}: CategoryListingsProps) {
  const { t } = useLanguage()
  // Локальное состояние фильтров каталога.
  const [activeCategory, setActiveCategory] = useState(() =>
    CATEGORIES.find((category) => category.label === searchFilters.category)?.id ?? 'all',
  )
  const [taxIncluded, setTaxIncluded] = useState(false)
  const [minPrice, setMinPrice] = useState(searchFilters.minPrice?.toString() ?? '')
  const [maxPrice, setMaxPrice] = useState(searchFilters.maxPrice?.toString() ?? '')
  const [minimumRating, setMinimumRating] = useState(searchFilters.minimumRating?.toString() ?? '')
  const [visibleCount, setVisibleCount] = useState(showAllListings ? Infinity : 8)
  const searchFiltersKey = JSON.stringify(searchFilters)

  useEffect(() => {
    setActiveCategory(CATEGORIES.find((category) => category.label === searchFilters.category)?.id ?? 'all')
    setMinPrice(searchFilters.minPrice?.toString() ?? '')
    setMaxPrice(searchFilters.maxPrice?.toString() ?? '')
    setMinimumRating(searchFilters.minimumRating?.toString() ?? '')
  }, [searchFilters.category, searchFilters.minPrice, searchFilters.maxPrice, searchFilters.minimumRating])

  useEffect(() => {
    setVisibleCount(showAllListings ? Infinity : 8)
  }, [searchFiltersKey, listings, showAllListings])

  useEffect(() => {
    if (expandAllRevision > 0) setVisibleCount(Infinity)
  }, [expandAllRevision])

  function clearFilters() {
    onClearRegionFilter()
    setActiveCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setMinimumRating('')
    onGuestCountChange(1)
    onSearchFiltersChange({ category: null, minPrice: null, maxPrice: null, minimumRating: null })
  }
  const visibleListings = listings.slice(0, visibleCount)

  return (
    <section id="stays" className="category-listings" aria-label={t('Категорії та помешкання')}>
      <CategoryNavigation
        activeCategory={activeCategory}
        onActiveCategoryChange={(category) => {
          setActiveCategory(category)
          onSearchFiltersChange({ category: category === 'all' ? null : CATEGORIES.find((item) => item.id === category)?.label ?? null })
        }}
        selectedRegion={selectedRegion}
        onSelectRegion={onSelectRegion}
        onClearFilters={clearFilters}
        allRegions={allRegions}
        taxIncluded={taxIncluded}
        onTaxIncludedChange={setTaxIncluded}
        minPrice={minPrice}
        onMinPriceChange={(value) => {
          setMinPrice(value)
          onSearchFiltersChange({ minPrice: value ? Number(value) : null })
        }}
        maxPrice={maxPrice}
        onMaxPriceChange={(value) => {
          setMaxPrice(value)
          onSearchFiltersChange({ maxPrice: value ? Number(value) : null })
        }}
        minimumRating={minimumRating}
        onMinimumRatingChange={(value) => {
          setMinimumRating(value)
          onSearchFiltersChange({ minimumRating: value ? Number(value) : null })
        }}
        guests={String(guestCount)}
        onGuestsChange={(value) => onGuestCountChange(Math.max(1, Number(value) || 1))}
      />

      {/* Пустой список при загрузке или ошибке вместо устаревших карточек. */}
      <ListingGrid
        listings={isLoading || error ? [] : visibleListings}
        isLoading={isLoading}
        error={error}
        taxIncluded={taxIncluded}
        savedIds={savedIds}
        onOpenListing={onOpenListing}
        onToggleSave={onToggleSave}
      />

      <div className="category-listings__continue">
        <h2>
          {selectedRegion
            ? `${t('Продовжити огляд регіону')} «${selectedRegion}»`
            : `${t('Продовжити огляд категорії')} «${t(CATEGORIES.find((c) => c.id === activeCategory)?.label ?? '')}»`}
        </h2>
        {visibleCount < listings.length && (
          <button
            type="button"
            className="category-listings__more"
            onClick={() => setVisibleCount((count) => count + 8)}
          >
            {t('Показати більше')}
          </button>
        )}
      </div>
    </section>
  )
}
