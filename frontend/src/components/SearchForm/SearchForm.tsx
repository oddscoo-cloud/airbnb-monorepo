import { type FormEvent } from 'react'
import { Search } from 'lucide-react'
import './SearchForm.css'

export function SearchForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <form
      className="search-form"
      role="search"
      aria-label="Пошук помешкань"
      onSubmit={handleSubmit}
    >
      <div className="search-form__field">
        <label htmlFor="destination">Куди</label>
        <input
          id="destination"
          name="destination"
          type="text"
          placeholder="Пошук напрямку"
          autoComplete="off"
        />
      </div>

      <div className="search-form__divider" aria-hidden="true" />

      <div className="search-form__field">
        <label htmlFor="check-in">Прибуття</label>
        <input
          id="check-in"
          name="checkIn"
          type="text"
          placeholder="Додайте дати"
        />
      </div>

      <div className="search-form__divider" aria-hidden="true" />

      <div className="search-form__field">
        <label htmlFor="check-out">Виїзд</label>
        <input
          id="check-out"
          name="checkOut"
          type="text"
          placeholder="Додайте дати"
        />
      </div>

      <div className="search-form__divider" aria-hidden="true" />

      <div className="search-form__field search-form__field--guests">
        <label htmlFor="guests">Хто</label>
        <input
          id="guests"
          name="guests"
          type="text"
          placeholder="Додайте гостей"
        />
      </div>

      <button className="search-form__submit" type="submit" aria-label="Пошук">
        <Search size={18} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </form>
  )
}
