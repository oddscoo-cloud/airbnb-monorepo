import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
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
  // Локальное состояние видимости меню; значения фильтров принадлежат родителю.
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState(false)
  const categoryNavRef = useRef<HTMLDivElement>(null)
  const categoryListRef = useRef<HTMLUListElement>(null)
  const [categoryOverflow, setCategoryOverflow] = useState({ left: false, right: false })
  const activeFilterCount = [
    minPrice,
    maxPrice,
    minimumRating,
    guests !== '1' ? guests : '',
    selectedRegion ?? '',
  ].filter(Boolean).length

  useEffect(() => {
    if (!isFilterMenuOpen && !isRegionPickerOpen) return

    function handleOutsideClick(event: MouseEvent) {
      const nav = categoryNavRef.current
      if (nav && !event.composedPath().includes(nav)) {
        setIsFilterMenuOpen(false)
        setIsRegionPickerOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsFilterMenuOpen(false)
        setIsRegionPickerOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isFilterMenuOpen, isRegionPickerOpen])

  useEffect(() => {
    const list = categoryListRef.current
    if (!list) return

    const updateOverflow = () => {
      const hasOverflow = list.scrollWidth > list.clientWidth + 1
      if (!hasOverflow && list.scrollLeft !== 0) list.scrollLeft = 0
      const left = hasOverflow && list.scrollLeft > 1
      const right = hasOverflow && list.scrollLeft + list.clientWidth < list.scrollWidth - 1
      setCategoryOverflow((current) => current.left === left && current.right === right
        ? current
        : { left, right })
    }

    const resizeObserver = new ResizeObserver(updateOverflow)
    resizeObserver.observe(list)
    if (list.parentElement) resizeObserver.observe(list.parentElement)
    list.querySelectorAll('li').forEach((item) => resizeObserver.observe(item))
    list.addEventListener('scroll', updateOverflow, { passive: true })
    window.addEventListener('resize', updateOverflow)
    updateOverflow()

    return () => {
      resizeObserver.disconnect()
      list.removeEventListener('scroll', updateOverflow)
      window.removeEventListener('resize', updateOverflow)
    }
  }, [])

  function scrollCategories() {
    const list = categoryListRef.current
    if (!list) return
    const direction = categoryOverflow.right ? 1 : -1
    list.scrollBy({ left: direction * list.clientWidth * 0.75, behavior: 'smooth' })
  }

  return (
    <div className="category-nav" ref={categoryNavRef}>
      <ul className="category-nav__list" ref={categoryListRef}>
        {/* Иконки категорий из конфигурации categories.ts. */}
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

      <button
        type="button"
        className={`category-nav__scroll${categoryOverflow.left || categoryOverflow.right ? ' category-nav__scroll--visible' : ''}`}
        aria-label={categoryOverflow.right ? 'Показати наступні категорії' : 'Повернутися до попередніх категорій'}
        aria-hidden={!categoryOverflow.left && !categoryOverflow.right}
        tabIndex={categoryOverflow.left || categoryOverflow.right ? 0 : -1}
        onClick={scrollCategories}
      >
        {categoryOverflow.right ? <ChevronRight size={16} aria-hidden /> : <ChevronLeft size={16} aria-hidden />}
      </button>

      <div className="category-nav__filters-wrap">
        <button
          type="button"
          className={`category-nav__filters${activeFilterCount ? ' category-nav__filters--active' : ''}`}
          onClick={() => {
            setIsRegionPickerOpen(false)
            setIsFilterMenuOpen((value) => !value)
          }}
          aria-expanded={isFilterMenuOpen}
          aria-haspopup="dialog"
          aria-controls="category-filter-menu"
        >
          <SlidersHorizontal size={14} aria-hidden />
          <span>Фільтри</span>
          {activeFilterCount > 0 && (
            <span className="category-nav__filters-count" aria-label={`Активних фільтрів: ${activeFilterCount}`}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Передача значений полей родителю для пересчёта каталога. */}
        {isFilterMenuOpen && (
          <div className="category-nav__filter-menu" id="category-filter-menu" role="dialog" aria-labelledby="category-filter-title">
            {isRegionPickerOpen ? (
              <>
                <div className="category-nav__filter-header">
                  <div className="category-nav__region-picker-title">
                    <button
                      type="button"
                      className="category-nav__region-back"
                      aria-label="Повернутися до фільтрів"
                      onClick={() => setIsRegionPickerOpen(false)}
                    >
                      <ChevronLeft size={18} aria-hidden />
                    </button>
                    <div>
                      <h2 className="category-nav__filter-title" id="category-filter-title">Виберіть регіон</h2>
                      <p>Оберіть область або місто</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="category-nav__filter-close"
                    aria-label="Закрити фільтри"
                    onClick={() => {
                      setIsRegionPickerOpen(false)
                      setIsFilterMenuOpen(false)
                    }}
                  >
                    <X size={18} aria-hidden />
                  </button>
                </div>
                <div className="category-nav__region-list">
                  <button
                    type="button"
                    className={`category-nav__region-option${selectedRegion === null ? ' category-nav__region-option--active' : ''}`}
                    onClick={() => {
                      onSelectRegion(null)
                      setIsRegionPickerOpen(false)
                      setIsFilterMenuOpen(false)
                    }}
                  >
                    Усі регіони
                  </button>
                  {allRegions.length > 0 ? allRegions.map((region) => (
                    <button
                      key={region}
                      type="button"
                      className={`category-nav__region-option${selectedRegion === region ? ' category-nav__region-option--active' : ''}`}
                      onClick={() => {
                        onSelectRegion(region)
                        setIsRegionPickerOpen(false)
                        setIsFilterMenuOpen(false)
                      }}
                    >
                      {region}
                    </button>
                  )) : (
                    <p className="category-nav__region-empty">Регіони поки недоступні.</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="category-nav__filter-header">
                  <div>
                    <h2 className="category-nav__filter-title" id="category-filter-title">Фільтри</h2>
                    <p>Знайдіть помешкання для своєї подорожі</p>
                  </div>
                  <button
                    type="button"
                    className="category-nav__filter-close"
                    aria-label="Закрити фільтри"
                    onClick={() => {
                      setIsRegionPickerOpen(false)
                      setIsFilterMenuOpen(false)
                    }}
                  >
                    <X size={18} aria-hidden />
                  </button>
                </div>

                <section className="category-nav__filter-section" aria-labelledby="category-filter-price">
                  <h3 className="category-nav__filter-section-title" id="category-filter-price">Ціна за ніч</h3>
                  <div className="category-nav__price-range">
                    <label className="category-nav__filter-field">
                      <span>Від</span>
                      <div className="category-nav__price-input">
                        <span aria-hidden>$</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Будь-яка"
                          value={minPrice}
                          onChange={(event) => onMinPriceChange(event.target.value)}
                        />
                      </div>
                    </label>
                    <label className="category-nav__filter-field">
                      <span>До</span>
                      <div className="category-nav__price-input">
                        <span aria-hidden>$</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Будь-яка"
                          value={maxPrice}
                          onChange={(event) => onMaxPriceChange(event.target.value)}
                        />
                      </div>
                    </label>
                  </div>
                </section>

                <label className="category-nav__filter-field category-nav__filter-section">
                  <span className="category-nav__filter-section-title">Мінімальний рейтинг</span>
                  <select value={minimumRating} onChange={(event) => onMinimumRatingChange(event.target.value)}>
                    <option value="">Будь-який</option>
                    <option value="4">Від 4,0</option>
                    <option value="4.5">Від 4,5</option>
                    <option value="4.8">Від 4,8</option>
                  </select>
                </label>

                <label className="category-nav__filter-field category-nav__filter-section">
                  <span className="category-nav__filter-section-title">Гості</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Кількість гостей"
                    value={guests}
                    onChange={(event) => onGuestsChange(event.target.value)}
                  />
                </label>

                <section className="category-nav__filter-section" aria-labelledby="category-filter-region">
                  <h3 className="category-nav__filter-section-title" id="category-filter-region">Регіон</h3>
                  <button type="button" className="category-nav__filter-region" onClick={() => setIsRegionPickerOpen(true)}>
                    <span className="category-nav__filter-region-copy">
                      <span className="category-nav__filter-region-value">{selectedRegion ?? 'Усі регіони'}</span>
                      <span>{selectedRegion ? 'Обраний регіон' : 'Оберіть область або місто'}</span>
                    </span>
                    <ChevronRight size={18} aria-hidden />
                  </button>
                </section>

                <div className="category-nav__filter-footer">
                  <button type="button" className="category-nav__filter-reset" onClick={() => {
                    onClearFilters()
                    setIsFilterMenuOpen(false)
                  }}>
                    Скинути фільтри
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Переключатель с поддержкой мыши, Enter и Space. */}
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
