import { useState } from 'react'
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
const MONTHS = Array.from({ length: 2 }, (_, offset) => {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() + offset)
  return {
    label: new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' }).format(date),
    year: date.getFullYear(),
    month: date.getMonth(),
    disabledThrough: offset === 0 ? new Date().getDate() - 1 : 0,
  }
})

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
}: {
  listing: Listing
  expanded?: boolean
  onBook?: () => void
  dateRangeText?: string
}) {
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
            <a href="#nights">${listing.price} х 5 ночей</a>
            <span>$ {listing.price * 5}</span>
          </div>
          <div className="property__widget-price-row">
            <a href="#cleaning">Плата за прибирання</a>
            <span>$ 20</span>
          </div>
          <div className="property__widget-divider" />
          <div className="property__widget-price-row property__widget-price-row--total">
            <span>Усього до сплати податків</span>
            <span>$ {listing.price * 5 + 20}</span>
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
  onBack: () => void
  onBook: () => void
  onOpenSignIn: () => void
  onOpenRegister: () => void
}

export function PropertyDetail({ listing, onBack, onBook, onOpenSignIn, onOpenRegister }: BuildingpageProps) {
  const [activeSection, setActiveSection] = useState('photos')
  const [showMap, setShowMap] = useState(false)
  const [selectedStart, setSelectedStart] = useState<Date | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null)

  void onOpenRegister

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
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date)
      setSelectedEnd(null)
      return
    }

    if (date < selectedStart) {
      setSelectedEnd(selectedStart)
      setSelectedStart(date)
      return
    }

    setSelectedEnd(date)
  }

  function isDateInSelectedRange(date: Date) {
    if (!selectedStart) return false
    const rangeEnd = selectedEnd ?? selectedStart
    const min = new Date(Math.min(selectedStart.getTime(), rangeEnd.getTime()))
    const max = new Date(Math.max(selectedStart.getTime(), rangeEnd.getTime()))
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
          <span>Почніть пошук</span>
        </div>

        <div className="property__header-actions">
          <a href="#host-your-home">Запропонувати помешкання на HomeFU</a>
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
            <p className="property__date-range">{formatRange(selectedStart, selectedEnd)}</p>

            <div className="property__calendars">
              {MONTHS.map((m) => {
                const cells = getMonthGrid(m.year, m.month)
                return (
                  <div key={m.label} className="property__calendar">
                    <h3>{m.label}</h3>
                    <div className="property__calendar-weekdays">
                      {WEEKDAYS.map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                    <div className="property__calendar-grid">
                      {cells.map((day, i) => {
                        const date = day ? new Date(m.year, m.month, day) : null
                        const isSelected = date ? isDateInSelectedRange(date) : false
                        const isExactStart = date && selectedStart && date.getTime() === selectedStart.getTime()
                        const isExactEnd = date && selectedEnd && date.getTime() === selectedEnd.getTime()
                        return (
                          <button
                            key={i}
                            type="button"
                            className={[
                              'property__calendar-day',
                              day && day <= m.disabledThrough ? 'property__calendar-day--disabled' : '',
                              isSelected ? 'property__calendar-day--selected' : '',
                              isExactStart || isExactEnd ? 'property__calendar-day--range-edge' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => date && handleCalendarDateClick(date)}
                            disabled={!date || !!(date && day && day <= m.disabledThrough)}
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

            <a href="#clear-dates" className="property__clear-dates">
              Очистити дати
            </a>
          </section>

          <div className="property__divider" />

          <section id="reviews" className="property__section">
            <h2 className="property__section-title">
              {listing.rating !== null
                ? `${listing.rating.toFixed(2)} · ${listing.reviewCount} відгуків`
                : 'Відгуків ще немає'}
            </h2>
            {listing.reviews.length > 0 && <div className="property__reviews">
              {listing.reviews.map((review) => (
                <article key={review.id} className="property__review">
                  <h3><Star size={14} fill="currentColor" aria-hidden /> {review.rating.toFixed(1)}</h3>
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>}
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
          <BookingWidget listing={listing} expanded onBook={onBook} dateRangeText={formatRange(selectedStart, selectedEnd)} />
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
