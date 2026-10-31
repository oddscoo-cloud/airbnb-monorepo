import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { RegionPickerPanel } from '../RegionPickerPanel/RegionPickerPanel'
import { DatePickerPanel } from '../DatePickerPanel/DatePickerPanel'
import { ShowMapButton } from '../ShowMapButton/ShowMapButton'
import './SearchForm.css'

interface SearchFormProps {
  selectedRegion?: string | null
  regions: string[]
  onRegionSelect?: (region: string) => void
  onFocusRegion?: () => void
  onFocusDates?: () => void
  onClosePanels?: () => void
  onOpenMap?: () => void
  guests: number
  onGuestsChange: (guests: number) => void
  stayDates: { start: Date | null; end: Date | null }
  onStayDatesChange: (dates: { start: Date | null; end: Date | null }) => void
  onSearch: () => void
}

export function SearchForm({
  selectedRegion,
  regions,
  onRegionSelect,
  onFocusRegion,
  onFocusDates,
  onClosePanels,
  onOpenMap,
  guests,
  onGuestsChange,
  stayDates,
  onStayDatesChange,
  onSearch,
}: SearchFormProps) {
  // Активная панель поиска: регион, даты или закрытое состояние.
  const [activePanel, setActivePanel] = useState<'region' | 'dates' | 'guests' | null>(null)
  const searchShellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activePanel) return

    function handleOutsideClick(event: MouseEvent) {
      if (event.target instanceof Node && !searchShellRef.current?.contains(event.target)) {
        setActivePanel(null)
        onClosePanels?.()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActivePanel(null)
        onClosePanels?.()
      }
    }

    document.addEventListener('click', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [activePanel, onClosePanels])

  const formatDate = (date: Date | null) => date
    ? date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
    : 'Додайте дати'
  const guestNoun = guests === 1 ? 'гість' : guests < 5 ? 'гостя' : 'гостей'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch()
  }

  function openRegionPanel() {
    // Изменение оформления header через callback родителя.
    setActivePanel('region')
    onFocusRegion?.()
  }

  function openDatePanel() {
    setActivePanel('dates')
    onFocusDates?.()
  }

  function closePanels() {
    // Закрытие панели и возврат обычного оформления шапки.
    setActivePanel(null)
    onClosePanels?.()
  }

  return (
    <div ref={searchShellRef} className={`search-form-shell${activePanel ? ' search-form-shell--active' : ''}`}>
      <form
        id="home-search"
        className="search-form"
        role="search"
        aria-label="Пошук помешкань"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="search-form__field"
          onClick={openRegionPanel}
          aria-label="Вибрати регіон"
        >
          <span className="search-form__label">Куди</span>
          <span className="search-form__placeholder">
            {selectedRegion ?? 'Пошук напрямку'}
          </span>
        </button>

        <div className="search-form__divider" aria-hidden="true" />

        <button
          type="button"
          className="search-form__field"
          onClick={openDatePanel}
          aria-label="Вибрати дати прибуття та виїзду"
        >
          <span className="search-form__label">Прибуття</span>
          <span className="search-form__placeholder">{formatDate(stayDates.start)}</span>
        </button>

        <div className="search-form__divider" aria-hidden="true" />

        <button
          type="button"
          className="search-form__field"
          onClick={openDatePanel}
          aria-label="Вибрати дату виїзду"
        >
          <span className="search-form__label">Виїзд</span>
          <span className="search-form__placeholder">{formatDate(stayDates.end)}</span>
        </button>

        <div className="search-form__divider" aria-hidden="true" />

        <button
          type="button"
          className="search-form__field search-form__field--guests"
          aria-label="Вибрати гостей"
          aria-expanded={activePanel === 'guests'}
          onClick={() => {
            if (activePanel === 'guests') {
              closePanels()
            } else {
              setActivePanel('guests')
              onFocusDates?.()
            }
          }}
        >
          <span className="search-form__label">Хто</span>
          <span className="search-form__placeholder">{guests} {guestNoun}</span>
        </button>

        <button className="search-form__submit" type="submit" aria-label="Пошук">
          <Search size={18} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </form>

      <ShowMapButton onClick={() => onOpenMap?.()} />

      {/* Передача выбранного региона родителю и закрытие панели. */}
      {activePanel === 'region' && (
        <RegionPickerPanel
          regions={regions}
          onClose={closePanels}
          onSelectRegion={(region) => {
            onRegionSelect?.(region)
            closePanels()
          }}
        />
      )}
      {activePanel === 'dates' && (
        <DatePickerPanel
          startDate={stayDates.start}
          endDate={stayDates.end}
          onSelect={(start, end) => onStayDatesChange({ start, end })}
          onClose={closePanels}
        />
      )}
      {activePanel === 'guests' && (
        <div className="guest-picker" role="dialog" aria-label="Кількість гостей">
          <span className="guest-picker__label">Гості</span>
          <button type="button" onClick={() => onGuestsChange(Math.max(1, guests - 1))} aria-label="Зменшити кількість гостей" disabled={guests <= 1}>−</button>
          <output aria-live="polite">{guests}</output>
          <button type="button" onClick={() => onGuestsChange(Math.min(16, guests + 1))} aria-label="Збільшити кількість гостей" disabled={guests >= 16}>+</button>
        </div>
      )}
    </div>
  )
}
