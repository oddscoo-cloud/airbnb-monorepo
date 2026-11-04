import { useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Search,
  Share,
  Heart,
  Star,
  Flag,
} from 'lucide-react'
import type { Listing } from '../../types/listing'
import { LocationMap } from '../Map/LocationMap'
import { UserMenu } from '../UserMenu/UserMenu'
import { PropertyCalendar } from './PropertyCalendar'
import { PropertyReviews } from './PropertyReviews'
import './Buildingpage.css'

const SECTIONS = [
  { id: 'photos', label: 'Фотографії' },
  { id: 'amenities', label: 'Зручності' },
  { id: 'reviews', label: 'Відгуки' },
  { id: 'location', label: 'Розташування' },
]

// Создание HTML-иконки маркера для Leaflet.
const mapPinIcon = L.divIcon({
  html: renderToStaticMarkup(<span className="property__map-pin">HFU</span>),
  className: 'property__map-pin-wrapper',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

// Переиспользуемая сводка цены для боковой панели объявления.
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
  // Демонстрационная стоимость: цена за ночь, длительность и фиксированная уборка.
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
  onOpenRegister?: () => void
  onOpenProfile?: () => void
  onOpenAdmin?: () => void
  onHost?: () => void
  onLogout?: () => void
  isSaved?: boolean
  onToggleSave?: (listingId: number) => void
  savedCount?: number
}

export function PropertyDetail({
  listing,
  stayDates,
  onStayDatesChange,
  stayNights,
  onBack,
  onStartSearch,
  onHome,
  onReviewAdded,
  onBook,
  onOpenSignIn,
  onOpenRegister,
  onOpenProfile,
  onOpenAdmin,
  onHost,
  onLogout,
  isSaved = false,
  onToggleSave,
  savedCount,
}: BuildingpageProps) {
  // Локальное состояние навигации страницы объявления.
  const [activeSection, setActiveSection] = useState('photos')
  const [showMap, setShowMap] = useState(false)

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

  // Нулевые координаты трактуются как отсутствие местоположения.
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

  // Полноэкранный режим карты до возврата на страницу жилья.
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
          <a href="/" onClick={(event) => { event.preventDefault(); (onHost ?? onHome)() }}>Запропонувати помешкання на HomeFU</a>
          <UserMenu
            savedCount={savedCount}
            onOpenProfile={onOpenProfile}
            onOpenSaved={onOpenProfile}
            onOpenAdmin={onOpenAdmin}
            onSignIn={onOpenSignIn}
            onRegister={onOpenRegister}
            onLogout={onLogout}
          />
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
              <button
                type="button"
                className={`property__save-btn${isSaved ? ' property__save-btn--saved' : ''}`}
                onClick={() => onToggleSave?.(Number(listing.id))}
              >
                <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} aria-hidden /> {isSaved ? 'Збережено' : 'Зберегти'}
              </button>
            </div>
          </div>

          {/* Cover-фото и до четырёх дополнительных изображений. */}
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

          {/* Выбранные даты из App и callback их изменения. */}
          <PropertyCalendar
            location={listing.location}
            stayDates={stayDates}
            onStayDatesChange={onStayDatesChange}
          />

          <div className="property__divider" />

          {/* Обновление агрегированных данных объявления после добавления отзыва. */}
          <PropertyReviews
            listingId={listing.id}
            initialReviews={listing.reviews}
            onReviewAdded={onReviewAdded}
          />

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
  // Публичная точка входа страницы объявления.
  return <PropertyDetail {...props} />
}
