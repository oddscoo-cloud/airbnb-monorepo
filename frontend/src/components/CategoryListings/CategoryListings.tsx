import { useMemo, useState, type ComponentType } from 'react'
import {
  Mountain,
  Home,
  Building2,
  DoorOpen,
  BedDouble,
  Gem,
  Building,
  Trees,
  Palette,
  Waves,
  Castle,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Heart,
  Star,
  X,
} from 'lucide-react'
import './CategoryListings.css'

interface Category {
  id: string
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>
}

const CATEGORIES: Category[] = [
  { id: 'all', label: 'Усі помешкання', icon: Home },
  { id: 'views', label: 'Гарні краєвиди', icon: Mountain },
  { id: 'small-flats', label: 'Невеликі квартири', icon: Home },
  { id: 'big-flats', label: 'Великі квартири', icon: Building2 },
  { id: 'rooms', label: 'Кімнати', icon: DoorOpen },
  { id: 'hostels', label: 'Хостели', icon: BedDouble },
  { id: 'luxe', label: 'Люкс', icon: Gem },
  { id: 'downtown', label: 'У центрі міста', icon: Building },
  { id: 'countryside', label: 'Сільська місцевість', icon: Trees },
  { id: 'designer', label: 'Від дизайнера', icon: Palette },
  { id: 'seaside', label: 'Біля моря', icon: Waves },
  { id: 'mansions', label: 'Особняки', icon: Castle },
  { id: 'legendary', label: 'Легендарне', icon: Sparkles },
]

export interface Listing {
  id: string
  title: string
  description: string | null
  location: string
  category: string
  region: string
  price: number
  rating: number | null
  reviewCount: number
  maxGuests: number
  amenities: { id: number; name: string; icon: string }[]
  reviews: { id: number; rating: number; comment: string; createdAt: string }[]
  isPublished: boolean
  image: string
  gallery?: string[]
  latitude: number
  longitude: number
}

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
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minimumRating, setMinimumRating] = useState('')
  const [guests, setGuests] = useState('1')

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

  function clearFilters() {
    onClearRegionFilter()
    setActiveCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setMinimumRating('')
    setGuests('1')
  }

  const allRegions = [...new Set(listings.map((listing) => listing.region).filter(Boolean))]

  return (
    <section className="category-listings" aria-label="Категорії та помешкання">
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
                  onClick={() => setActiveCategory(category.id)}
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
          <button
            type="button"
            className="category-nav__filters"
            onClick={() => setIsFilterMenuOpen((value) => !value)}
          >
            <SlidersHorizontal size={14} aria-hidden />
            <span>Фільтри</span>
          </button>

          {isFilterMenuOpen && (
            <div className="category-nav__filter-menu" role="dialog" aria-label="Фільтри помешкань">
              <label className="category-nav__filter-field">
                <span>Ціна за ніч, від</span>
                <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} />
              </label>
              <label className="category-nav__filter-field">
                <span>Ціна за ніч, до</span>
                <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} />
              </label>
              <label className="category-nav__filter-field">
                <span>Мінімальний рейтинг</span>
                <select value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)}>
                  <option value="">Будь-який</option>
                  <option value="4">Від 4,0</option>
                  <option value="4.5">Від 4,5</option>
                  <option value="4.8">Від 4,8</option>
                </select>
              </label>
              <label className="category-nav__filter-field">
                <span>Гості</span>
                <input type="number" min="1" value={guests} onChange={(event) => setGuests(event.target.value)} />
              </label>
              <button
                type="button"
                className="category-nav__filter-item"
                onClick={() => {
                  setIsRegionPickerOpen(true)
                  setIsFilterMenuOpen(false)
                }}
              >
                Регіон
              </button>
              <button
                type="button"
                className="category-nav__filter-item"
                onClick={() => {
                  clearFilters()
                  setIsFilterMenuOpen(false)
                }}
              >
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
              <button
                type="button"
                className="category-nav__region-option category-nav__region-option--clear"
                onClick={() => {
                  clearFilters()
                  setIsRegionPickerOpen(false)
                }}
              >
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
            onClick={() => setTaxIncluded((value) => !value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setTaxIncluded((value) => !value)
              }
            }}
          >
            <span className="category-nav__switch-knob" />
          </span>
        </label>
      </div>

      <div className="listings__grid">
        {isLoading ? <p>Завантаження помешкань…</p> : error ? <p role="alert">{error}</p> : filteredListings.length === 0 ? <p>За вибраними фільтрами помешкань не знайдено.</p> : filteredListings.map((listing) => (
          <article
            key={listing.id}
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
              {listing.image && <img
                className="listing-card__image"
                src={listing.image}
                alt={`Помешкання в ${listing.location}`}
                loading="lazy"
              />}
              <button
                type="button"
                className="listing-card__like"
                aria-label="Додати до збережених"
                onClick={(event) => event.stopPropagation()}
              >
                <Heart size={18} aria-hidden />
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
                <strong>${listing.price}</strong> ночі
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="category-listings__continue">
        <h2>
          {selectedRegion
            ? `Продовжити огляд регіону «${selectedRegion}»`
            : `Продовжити огляд категорії «${CATEGORIES.find((c) => c.id === activeCategory)?.label}»`}
        </h2>
        <button type="button" className="category-listings__more">
          Показати більше
        </button>
      </div>
    </section>
  )
}
