import { type FormEvent, useState } from 'react'
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
}

export function SearchForm({
  selectedRegion,
  regions,
  onRegionSelect,
  onFocusRegion,
  onFocusDates,
  onClosePanels,
  onOpenMap,
}: SearchFormProps) {
  const [activePanel, setActivePanel] = useState<'region' | 'dates' | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  function openRegionPanel() {
    setActivePanel('region')
    onFocusRegion?.()
  }

  function openDatePanel() {
    setActivePanel('dates')
    onFocusDates?.()
  }

  function closePanels() {
    setActivePanel(null)
    onClosePanels?.()
  }

  return (
    <div className={`search-form-shell${activePanel ? ' search-form-shell--active' : ''}`}>
      <form
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
          <span className="search-form__placeholder">Додайте дати</span>
        </button>

        <div className="search-form__divider" aria-hidden="true" />

        <button
          type="button"
          className="search-form__field"
          onClick={openDatePanel}
          aria-label="Вибрати дату виїзду"
        >
          <span className="search-form__label">Виїзд</span>
          <span className="search-form__placeholder">Додайте дати</span>
        </button>

        <div className="search-form__divider" aria-hidden="true" />

        <button
          type="button"
          className="search-form__field search-form__field--guests"
          aria-label="Вибрати гостей"
        >
          <span className="search-form__label">Хто</span>
          <span className="search-form__placeholder">Додайте гостей</span>
        </button>

        <button className="search-form__submit" type="submit" aria-label="Пошук">
          <Search size={18} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </form>

      <ShowMapButton onClick={() => onOpenMap?.()} />

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
      {activePanel === 'dates' && <DatePickerPanel onClose={closePanels} />}
    </div>
  )
}
