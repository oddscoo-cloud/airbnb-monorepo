import { useState, type FormEvent } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Search,
  Menu,
  User,
  Share,
  Heart,
  Star,
  Flag,
} from 'lucide-react'
import type { Listing } from '../CategoryListings/CategoryListings'
import { LocationMap } from '../Map/LocationMap'
import './Buildingpage.css'

const SECTIONS = [
  { id: 'photos', label: 'Фотографії' },
  { id: 'amenities', label: 'Зручності' },
  { id: 'reviews', label: 'Відгуки' },
  { id: 'location', label: 'Розташування' },
]

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const mapPinIcon = L.divIcon({
  html: renderToStaticMarkup(<span className="property__map-pin">HFU</span>),
  className: 'property__map-pin-wrapper',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7 // понедельник — первый день недели
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(startOffset).fill(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  return cells
}

function BookingWidget({
  listing,
  expanded = false,
  onBook,
  dateRangeText,
  stayNights,
}: {
  listing: Listing
  expanded?: boolean
  onBook?: () => void
  dateRangeText?: string
  stayNights: number
}) {
  const cleaningFee = 20
  const totalPrice = listing.price * stayNights + cleaningFee

  return (
    <div className="property__widget">
      <div className="property__widget-top">
        <span className="property__widget-price">${listing.price}</span>
        <span className="property__widget-night">ніч</span>
        {listing.rating !== null && <span className="property__widget-rating">
          <Star size={12} fill="currentColor" aria-hidden /> {listing.rating.toFixed(2)} ·{' '}
          <a href="#reviews">{listing.reviewCount} відгуків</a>
        </span>}
      </div>

      <div className="property__widget-dates">
        <div className="property__widget-dates-row">
          <div>
            <span className="property__widget-label">ПРИБУТТЯ</span>
            <span>{dateRangeText ? dateRangeText.split(' — ')[0] : 'Виберіть дату'}</span>
          </div>
          <div>
            <span className="property__widget-label">ВИЇЗД</span>
            <span>{dateRangeText ? dateRangeText.split(' — ')[1] ?? 'Виберіть дату' : 'Виберіть дату'}</span>
          </div>
        </div>
        <div className="property__widget-divider" />
        <div className="property__widget-guests">
          <span className="property__widget-label">ГОСТІ</span>
          <span>До {listing.maxGuests} гостей</span>
        </div>
      </div>

      <button type="button" className="property__widget-submit" onClick={onBook}>
        Забронювати
      </button>

      {expanded ? (
        <>
          <div className="property__widget-price-row">
            <a href="#nights">${listing.price} х {stayNights} ночей</a>
            <span>${listing.price * stayNights}</span>
          </div>
          <div className="property__widget-price-row">
            <a href="#cleaning">Плата за прибирання</a>
            <span>${cleaningFee}</span>
          </div>
          <div className="property__widget-divider" />
          <div className="property__widget-price-row property__widget-price-row--total">
            <span>Усього до сплати податків</span>
            <span>${totalPrice}</span>
          </div>
          <a href="#report" className="property__widget-report">
            <Flag size={12} aria-hidden /> Поскаржитись на це оголошення
          </a>
        </>
      ) : (
        <p className="property__widget-note">Поки що ви нічого не платите</p>
      )}
    </div>
  )
}

type BuildingpageProps = {
  listing: Listing
  stayDates: { start: Date | null; end: Date | null }
  onStayDatesChange: (dates: { start: Date | null; end: Date | null }) => void
  stayNights: number
  onBack: () => void
  onStartSearch: () => void
  onHome: () => void
  onReviewAdded: () => void
  onBook: () => void
  onOpenSignIn: () => void
  onOpenRegister: () => void
}

export function PropertyDetail({ listing, stayDates, onStayDatesChange, stayNights, onBack, onStartSearch, onHome, onReviewAdded, onBook, onOpenSignIn, onOpenRegister }: BuildingpageProps) {
  const [activeSection, setActiveSection] = useState('photos')
  const [showMap, setShowMap] = useState(false)
  const [reviews, setReviews] = useState(listing.reviews)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  void onOpenRegister

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setReviewError('')
    setIsReviewSubmitting(true)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const accessToken = sessionStorage.getItem('access_token')
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`

      const response = await fetch(`/api/listings/${listing.id}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message ?? 'Не вдалося додати відгук.')

      setReviews((current) => [result, ...current])
      setReviewComment('')
      setReviewRating(5)
      onReviewAdded()
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Не вдалося додати відгук.')
    } finally {
      setIsReviewSubmitting(false)
    }
  }

  function formatDate(date: Date | null) {
    return date
      ? new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
      : 'Виберіть дату'
  }

  function formatRange(start: Date | null, end: Date | null) {
    if (!start) return 'Виберіть дату'
    if (!end) return formatDate(start)
    const startStr = formatDate(start)
    const endStr = formatDate(end)
    return `${startStr} — ${endStr}`
  }

  function handleCalendarDateClick(date: Date) {
    const { start, end } = stayDates
    if (!start || end) {
      onStayDatesChange({ start: date, end: null })
      return
    }

    if (date < start) {
      onStayDatesChange({ start: date, end: start })
      return
    }

    if (date.getTime() === start.getTime()) return
    onStayDatesChange({ start, end: date })
  }

  function isDateInSelectedRange(date: Date) {
    if (!stayDates.start) return false
    const rangeEnd = stayDates.end ?? stayDates.start
    const min = new Date(Math.min(stayDates.start.getTime(), rangeEnd.getTime()))
    const max = new Date(Math.max(stayDates.start.getTime(), rangeEnd.getTime()))
    const candidate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return candidate >= min && candidate <= max
  }

  const hasLocation = listing.latitude !== 0 && listing.longitude !== 0
  const mapCenter: [number, number] = [listing.latitude, listing.longitude]
  const locationMap = hasLocation ? (
    <div className="property__map-preview" role="presentation">
      <MapContainer center={mapCenter} zoom={14} scrollWheelZoom={false} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={mapCenter} icon={mapPinIcon} />
      </MapContainer>
    </div>
  ) : <p>Координати помешкання не вказані.</p>

  if (showMap) {
    return <LocationMap listings={[listing]} onBack={() => setShowMap(false)} />
  }

  return (
    <div className="property">
      <header className="property__header">
        <button type="button" className="property__logo" onClick={onBack}>
          HomeFU
        </button>

        <div className="property__search">
          <Search size={16} aria-hidden />
          <button type="button" onClick={onStartSearch}>Почніть пошук</button>
        </div>

        <div className="property__header-actions">
          <a href="/" onClick={(event) => { event.preventDefault(); onHome() }}>Запропонувати помешкання на HomeFU</a>
          <button type="button" className="property__menu" aria-label="Меню" onClick={onOpenSignIn}>
            <Menu size={16} aria-hidden />
            <User size={20} aria-hidden />
          </button>
        </div>
      </header>

      <div className="property__layout">
        <main className="property__main">
          <h1 className="property__title">{listing.title}</h1>

          <div className="property__meta-row">
            <p className="property__meta">
              {listing.rating !== null && <><Star size={14} fill="currentColor" aria-hidden /> {listing.rating.toFixed(2)} · {listing.reviewCount} відгуків · </>}
              {listing.location}
            </p>
            <div className="property__meta-actions">
              <button type="button">
                <Share size={14} aria-hidden /> Поділитися
              </button>
              <button type="button">
                <Heart size={14} aria-hidden /> Зберегти
              </button>
            </div>
          </div>

          <div className="property__gallery">
            {listing.gallery?.length ? <>
              <img className="property__gallery-main" src={listing.gallery[0]} alt={listing.title} />
              <div className="property__gallery-grid">
                {listing.gallery.slice(1, 5).map((src, i) => (
                  <img key={`${src}-${i}`} src={src} alt={`${listing.title}, фото ${i + 2}`} />
                ))}
              </div>
            </> : (
              <p>Для цього помешкання фотографії ще не додані.</p>
            )}
          </div>

          <h2 className="property__host-title">Помешкання для оренди</h2>
          <p className="property__host-sub">До {listing.maxGuests} гостей</p>

          <div className="property__divider" />

          <nav className="property__section-nav" aria-label="Розділи сторінки">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`property__section-nav-item${activeSection === section.id ? ' property__section-nav-item--active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </a>
            ))}
          </nav>

          <section id="photos" className="property__section">
            {listing.description
              ? <p className="property__description">{listing.description}</p>
              : <p className="property__description">Опис для цього помешкання ще не доданий.</p>}
          </section>

          <div className="property__divider" />

          <section id="amenities" className="property__section">
            <h2 className="property__section-title">Які тут зручності</h2>
            {listing.amenities.length > 0 ? (
              <div className="property__amenities">
                {listing.amenities.map((amenity) => <span key={amenity.id}>{amenity.name}</span>)}
              </div>
            ) : <p>Інформація про зручності ще не додана.</p>}
          </section>

          <div className="property__divider" />

          <section id="calendar" className="property__section">
            <h2 className="property__section-title">Дати перебування · {listing.location}</h2>
            <p className="property__date-range">{formatRange(stayDates.start, stayDates.end)}</p>

            <div className="property__calendar-controls">
              <label>
                <span>Місяць</span>
                <select
                  value={calendarMonth.getMonth()}
                  onChange={(event) => setCalendarMonth(new Date(calendarMonth.getFullYear(), Number(event.target.value), 1))}
                >
                  {Array.from({ length: 12 }, (_, month) => (
                    <option key={month} value={month}>
                      {new Intl.DateTimeFormat('uk-UA', { month: 'long' }).format(new Date(calendarMonth.getFullYear(), month, 1))}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Рік</span>
                <select
                  value={calendarMonth.getFullYear()}
                  onChange={(event) => setCalendarMonth(new Date(Number(event.target.value), calendarMonth.getMonth(), 1))}
                >
                  {Array.from({ length: 6 }, (_, offset) => new Date().getFullYear() + offset).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="property__calendars">
              {Array.from({ length: 2 }, (_, offset) => {
                const monthDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1)
                const year = monthDate.getFullYear()
                const month = monthDate.getMonth()
                const label = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' }).format(monthDate)
                const cells = getMonthGrid(year, month)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return (
                  <div key={label} className="property__calendar">
                    <h3>{label}</h3>
                    <div className="property__calendar-weekdays">
                      {WEEKDAYS.map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                    <div className="property__calendar-grid">
                      {cells.map((day, i) => {
                        const date = day ? new Date(year, month, day) : null
                        const isSelected = date ? isDateInSelectedRange(date) : false
                        const isExactStart = date && stayDates.start && date.getTime() === stayDates.start.getTime()
                        const isExactEnd = date && stayDates.end && date.getTime() === stayDates.end.getTime()
                        const isPastDate = date ? date < today : false
                        return (
                          <button
                            key={i}
                            type="button"
                            className={[
                              'property__calendar-day',
                              isPastDate ? 'property__calendar-day--disabled' : '',
                              isSelected ? 'property__calendar-day--selected' : '',
                              isExactStart || isExactEnd ? 'property__calendar-day--range-edge' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => date && handleCalendarDateClick(date)}
                            disabled={!date || isPastDate}
                          >
                            {day ?? ''}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <button type="button" className="property__clear-dates" onClick={() => onStayDatesChange({ start: null, end: null })}>
              Очистити дати
            </button>
          </section>

          <div className="property__divider" />

          <section id="reviews" className="property__section">
            <h2 className="property__section-title">
              {reviews.length > 0 ? `${(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(2)} · ${reviews.length} відгуків` : 'Відгуків ще немає'}
            </h2>
            {reviews.length > 0 && <div className="property__reviews">
              {reviews.map((review) => {
                const authorName = review.authorName || 'Анонімний користувач'
                const avatarUrl = review.avatarUrl && (review.avatarUrl.startsWith('/') || /^https?:\/\//i.test(review.avatarUrl))
                  ? review.avatarUrl
                  : null
                return (
                <article key={review.id} className="property__review">
                  <div className="property__review-avatar">
                    {avatarUrl ? <img src={avatarUrl} alt="" /> : authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{authorName}</h3>
                    <span className="property__review-rating"><Star size={14} fill="currentColor" aria-hidden /> {review.rating.toFixed(1)}</span>
                    <p>{review.comment}</p>
                  </div>
                </article>
                )
              })}
            </div>}
            <form className="property__review-form" onSubmit={handleReviewSubmit}>
              <h3>Залишити відгук</h3>
              <label>
                <span>Оцінка</span>
                <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} з 5</option>)}
                </select>
              </label>
              <label>
                <span>Коментар</span>
                <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} maxLength={2000} required />
              </label>
              {reviewError && <p className="property__review-error" role="alert">{reviewError}</p>}
              <button type="submit" disabled={isReviewSubmitting}>{isReviewSubmitting ? 'Надсилання…' : 'Додати відгук'}</button>
            </form>
          </section>

          <div className="property__divider" />

          <section id="location" className="property__section">
            <h2 className="property__section-title">Де ви будете</h2>
            <button type="button" className="property__map-preview-button" onClick={() => setShowMap(true)}>
              {locationMap}
            </button>
            <h3 className="property__location-title">{listing.location}</h3>
          </section>

          <div className="property__divider" />

          <section className="property__section">
            <h2 className="property__section-title">Важлива інформація</h2>
            <p>Максимальна кількість гостей: {listing.maxGuests}</p>
          </section>
        </main>

        <aside className="property__sidebar">
          <BookingWidget listing={listing} expanded onBook={onBook} dateRangeText={formatRange(stayDates.start, stayDates.end)} stayNights={stayNights} />
        </aside>
      </div>

      <footer className="property__footer">
        <span className="property__logo-inline">HomeFU</span>
        <span>{listing.location}</span>
        <a href="#support">Підтримка</a>
      </footer>
    </div>
  )
}

export default function Buildingpage(props: BuildingpageProps) {
  return <PropertyDetail {...props} />
}
