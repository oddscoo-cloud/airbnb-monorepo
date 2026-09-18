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

interface Listing {
  id: string
  location: string
  category: string
  region: string
  dates: string
  price: number
  rating: number
  image: string
}

const LISTINGS: Listing[] = [
  { id: '1', location: 'Odesa, Ukraine', category: 'Біля моря', region: 'Галичина', dates: '1-10лист.', price: 70, rating: 4.88, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80' },
  { id: '2', location: 'Odesa, Ukraine', category: 'Біля моря', region: 'Галичина', dates: '3-7груд.', price: 100, rating: 4.98, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80' },
  { id: '3', location: 'Odesa, Ukraine', category: 'Біля моря', region: 'Буковина', dates: '25-30груд.', price: 75, rating: 4.76, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80' },
  { id: '4', location: 'Odesa, Ukraine', category: 'Біля моря', region: 'Буковина', dates: '6-11груд.', price: 42, rating: 4.78, image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80' },
  { id: '5', location: 'Odesa, Ukraine', category: 'Біля моря', region: 'Румунія', dates: '5-10ноч.', price: 50, rating: 4.68, image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&q=80' },
  { id: '6', location: 'Odesa, Ukraine', category: 'Біля моря', region: 'Румунія', dates: '10-22ноч.', price: 28, rating: 4.78, image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80' },
  { id: '7', location: 'Kyiv, Ukraine', category: 'У центрі міста', region: 'Південна Італія', dates: '3-9груд.', price: 60, rating: 4.85, image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&q=80' },
  { id: '8', location: 'Lviv, Ukraine', category: 'Від дизайнера', region: 'Південна Італія', dates: '2-7груд.', price: 90, rating: 4.82, image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80' },
  { id: '9', location: 'Ternopil, Ukraine', category: 'Гарні краєвиди', region: 'Словенія', dates: '25-30груд.', price: 110, rating: 4.80, image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=600&q=80' },
  { id: '10', location: 'Kharkiv, Ukraine', category: 'Особняки', region: 'Крим', dates: '7-13лист.', price: 130, rating: 4.71, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80' },
  { id: '11', location: 'Zaporizhzhia, Ukraine', category: 'Великі квартири', region: 'Балкани', dates: '8-18ноч.', price: 90, rating: 4.68, image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80' },
  { id: '12', location: 'Mykolaiv, Ukraine', category: 'Кімнати', region: 'Франція', dates: '10-15ноч.', price: 122, rating: 4.66, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80' },
  { id: '13', location: 'Crimea, Ukraine', category: 'Гарні краєвиди', region: 'Крим', dates: '12-18лист.', price: 84, rating: 4.74, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&q=80' },
  { id: '14', location: 'Bucharest, Romania', category: 'Від дизайнера', region: 'Румунія', dates: '10-14груд.', price: 96, rating: 4.72, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80' },
  { id: '15', location: 'Ljubljana, Slovenia', category: 'Невеликі квартири', region: 'Словенія', dates: '9-13груд.', price: 88, rating: 4.91, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80' },
  { id: '16', location: 'Nice, France', category: 'Біля моря', region: 'Франція', dates: '17-24лист.', price: 118, rating: 4.95, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80' },
  { id: '17', location: 'Split, Croatia', category: 'Люкс', region: 'Балкани', dates: '22-28лист.', price: 144, rating: 4.89, image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80' },
  { id: '18', location: 'Chernivtsi, Ukraine', category: 'Невеликі квартири', region: 'Буковина', dates: '2-8груд.', price: 58, rating: 4.62, image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=80' },
]

interface CategoryListingsProps {
  selectedRegion: string | null
  onSelectRegion: (region: string | null) => void
  onClearRegionFilter: () => void
}

export function CategoryListings({
  selectedRegion,
  onSelectRegion,
  onClearRegionFilter,
}: CategoryListingsProps) {
  const [activeCategory, setActiveCategory] = useState('seaside')
  const [taxIncluded, setTaxIncluded] = useState(false)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState(false)

  const filteredListings = useMemo(() => {
    return LISTINGS.filter((listing) => {
      const matchesCategory = activeCategory === 'seaside' || listing.category === CATEGORIES.find((category) => category.id === activeCategory)?.label
      const matchesRegion = !selectedRegion || listing.region === selectedRegion
      return matchesCategory && matchesRegion
    })
  }, [activeCategory, selectedRegion])

  const allRegions = [...new Set(LISTINGS.map((listing) => listing.region))]

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
            <div className="category-nav__filter-menu" role="menu">
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
                  onClearRegionFilter()
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
                  onClearRegionFilter()
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
        {filteredListings.map((listing) => (
          <article key={listing.id} className="listing-card">
            <div className="listing-card__image-wrap">
              <img
                className="listing-card__image"
                src={listing.image}
                alt={`Помешкання в ${listing.location}`}
                loading="lazy"
              />
              <button
                type="button"
                className="listing-card__like"
                aria-label="Додати до збережених"
              >
                <Heart size={18} aria-hidden />
              </button>
            </div>

            <div className="listing-card__body">
              <div className="listing-card__row">
                <span className="listing-card__location">{listing.location}</span>
                <span className="listing-card__rating">
                  <Star size={13} fill="currentColor" aria-hidden />
                  {listing.rating.toFixed(2)}
                </span>
              </div>
              <p className="listing-card__meta">{listing.category}</p>
              <p className="listing-card__meta">{listing.dates}</p>
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
