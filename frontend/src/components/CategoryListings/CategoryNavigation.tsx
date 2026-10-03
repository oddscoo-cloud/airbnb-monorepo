import { useState } from 'react'
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES } from './categories'

type CategoryNavigationProps = {
  activeCategory: string
  onActiveCategoryChange: (category: string) => void
  selectedRegion: string | null
  onSelectRegion: (region: string | null) => void
  onClearFilters: () => void
  allRegions: string[]
  taxIncluded: boolean
  onTaxIncludedChange: (included: boolean) => void
  minPrice: string
  onMinPriceChange: (price: string) => void
  maxPrice: string
  onMaxPriceChange: (price: string) => void
  minimumRating: string
  onMinimumRatingChange: (rating: string) => void
  guests: string
  onGuestsChange: (guests: string) => void
}

export function CategoryNavigation({
  activeCategory,
  onActiveCategoryChange,
  selectedRegion,
  onSelectRegion,
  onClearFilters,
  allRegions,
  taxIncluded,
  onTaxIncludedChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  minimumRating,
  onMinimumRatingChange,
  guests,
  onGuestsChange,
}: CategoryNavigationProps) {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState(false)

  return (
    <div className="category-nav">
      <ul className="category-nav__list">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          const isActive = category.id === activeCategory
          return (
            <li key={category.id}>
              <button
                type="button"
                className={`category-nav__item${isActive ? ' category-nav__item--active' : ''}`}
                onClick={() => onActiveCategoryChange(category.id)}
                aria-pressed={isActive}
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden />
                <span>{category.label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <button type="button" className="category-nav__scroll" aria-label="Прокрутити категорії">
        <ChevronRight size={16} aria-hidden />
      </button>

      <div className="category-nav__filters-wrap">
        <button type="button" className="category-nav__filters" onClick={() => setIsFilterMenuOpen((value) => !value)}>
          <SlidersHorizontal size={14} aria-hidden />
          <span>Фільтри</span>
        </button>

        {isFilterMenuOpen && (
          <div className="category-nav__filter-menu" role="dialog" aria-label="Фільтри помешкань">
            <label className="category-nav__filter-field">
              <span>Ціна за ніч, від</span>
              <input type="number" min="0" value={minPrice} onChange={(event) => onMinPriceChange(event.target.value)} />
            </label>
            <label className="category-nav__filter-field">
              <span>Ціна за ніч, до</span>
              <input type="number" min="0" value={maxPrice} onChange={(event) => onMaxPriceChange(event.target.value)} />
            </label>
            <label className="category-nav__filter-field">
              <span>Мінімальний рейтинг</span>
              <select value={minimumRating} onChange={(event) => onMinimumRatingChange(event.target.value)}>
                <option value="">Будь-який</option>
                <option value="4">Від 4,0</option>
                <option value="4.5">Від 4,5</option>
                <option value="4.8">Від 4,8</option>
              </select>
            </label>
            <label className="category-nav__filter-field">
              <span>Гості</span>
              <input type="number" min="1" value={guests} onChange={(event) => onGuestsChange(event.target.value)} />
            </label>
            <button type="button" className="category-nav__filter-item" onClick={() => {
              setIsRegionPickerOpen(true)
              setIsFilterMenuOpen(false)
            }}>
              Регіон
            </button>
            <button type="button" className="category-nav__filter-item" onClick={() => {
              onClearFilters()
              setIsFilterMenuOpen(false)
            }}>
              Скинути фільтри
            </button>
          </div>
        )}
      </div>

      {isRegionPickerOpen && (
        <div className="category-nav__region-picker">
          <div className="category-nav__region-picker-header">
            <span>Вибрати регіон</span>
            <button type="button" aria-label="Закрити" onClick={() => setIsRegionPickerOpen(false)}>
              <X size={14} aria-hidden />
            </button>
          </div>
          <div className="category-nav__region-list">
            {allRegions.map((region) => (
              <button
                key={region}
                type="button"
                className={`category-nav__region-option${selectedRegion === region ? ' category-nav__region-option--active' : ''}`}
                onClick={() => {
                  onSelectRegion(region)
                  setIsRegionPickerOpen(false)
                }}
              >
                {region}
              </button>
            ))}
            <button type="button" className="category-nav__region-option category-nav__region-option--clear" onClick={() => {
              onClearFilters()
              setIsRegionPickerOpen(false)
            }}>
              Скинути
            </button>
          </div>
        </div>
      )}

      <label className="category-nav__toggle">
        <span>Загальна сума до оподаткування</span>
        <span
          className={`category-nav__switch${taxIncluded ? ' category-nav__switch--on' : ''}`}
          role="switch"
          aria-checked={taxIncluded}
          tabIndex={0}
          onClick={() => onTaxIncludedChange(!taxIncluded)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onTaxIncludedChange(!taxIncluded)
            }
          }}
        >
          <span className="category-nav__switch-knob" />
        </span>
      </label>
    </div>
  )
}
