import { useRef, useState } from 'react'
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
import { AmenityIcon } from '../AmenityIcon/AmenityIcon'
import { ListingGallery } from './ListingGallery'
import { formatPrice } from '../../utils/formatPrice'
import { useLanguage } from '../../i18n'
import './Buildingpage.css'

const AMENITIES_PREVIEW = 6

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
  const { t } = useLanguage()
  // Демонстрационная стоимость: цена за ночь, длительность и фиксированная уборка.
  const cleaningFee = 20
  const totalPrice = listing.price * stayNights + cleaningFee

  return (
    <div className="property__widget">
      <div className="property__widget-top">
        <span className="property__widget-price">${formatPrice(listing.price)}</span>
        <span className="property__widget-night">{t('ніч')}</span>
        {listing.rating !== null && <span className="property__widget-rating">
          <Star size={12} fill="currentColor" aria-hidden /> {listing.rating.toFixed(2)} ·{' '}
          <a href="#reviews">{listing.reviewCount} {t('відгуків')}</a>
        </span>}
      </div>

      <div className="property__widget-dates">
        <div className="property__widget-dates-row">
          <div>
            <span className="property__widget-label">{t('Прибуття').toUpperCase()}</span>
            <span>{dateRangeText ? dateRangeText.split(' — ')[0] : t('Виберіть дату')}</span>
          </div>
          <div>
            <span className="property__widget-label">{t('Виїзд').toUpperCase()}</span>
            <span>{dateRangeText ? dateRangeText.split(' — ')[1] ?? t('Виберіть дату') : t('Виберіть дату')}</span>
          </div>
        </div>
        <div className="property__widget-divider" />
        <div className="property__widget-guests">
          <span className="property__widget-label">{t('Гості').toUpperCase()}</span>
          <span>{t('До гостей')} {listing.maxGuests}</span>
        </div>
      </div>

      <button type="button" className="property__widget-submit" onClick={onBook}>
        {t('Забронювати')}
      </button>

      {expanded ? (
        <>
          <div className="property__widget-price-row">
            <a href="#nights">${formatPrice(listing.price)} × {stayNights} {t('ночей')}</a>
            <span>${formatPrice(listing.price * stayNights)}</span>
          </div>
          <div className="property__widget-price-row">
            <a href="#cleaning">{t('Плата за прибирання')}</a>
            <span>${cleaningFee}</span>
          </div>
          <div className="property__widget-divider" />
          <div className="property__widget-price-row property__widget-price-row--total">
            <span>{t('Усього до сплати податків')}</span>
            <span>${formatPrice(totalPrice)}</span>
          </div>
          <a href="#report" className="property__widget-report">
            <Flag size={12} aria-hidden /> {t('Поскаржитись на це оголошення')}
          </a>
        </>
      ) : (
        <p className="property__widget-note">{t('Поки що ви нічого не платите')}</p>
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
  const { language, t } = useLanguage()
  // Локальное состояние навигации страницы объявления.
  const [activeSection, setActiveSection] = useState('photos')
  const [showMap, setShowMap] = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const galleryScrollPosition = useRef(0)
  const galleryPreview = useRef<HTMLDivElement>(null)
  const galleryTriggerIndex = useRef(0)

  function openGallery(index: number) {
    galleryScrollPosition.current = window.scrollY
    galleryTriggerIndex.current = index
    setShowGallery(true)
    window.scrollTo(0, 0)
  }

  function closeGallery() {
    setShowGallery(false)
    requestAnimationFrame(() => {
      galleryPreview.current?.querySelectorAll('button')[galleryTriggerIndex.current]?.focus({ preventScroll: true })
      window.scrollTo(0, galleryScrollPosition.current)
    })
  }

  function formatDate(date: Date | null) {
    return date
      ? new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
      : t('Виберіть дату')
  }

  function formatRange(start: Date | null, end: Date | null) {
    if (!start) return t('Виберіть дату')
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
  ) : <p>{t('Координати помешкання не вказані.')}</p>

  if (showGallery) {
    return <ListingGallery listing={listing} isSaved={isSaved} onToggleSave={onToggleSave} onBack={closeGallery} />
  }

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
          <button type="button" onClick={onStartSearch}>{t('Почніть пошук')}</button>
        </div>

        <div className="property__header-actions">
          <a href="/" onClick={(event) => { event.preventDefault(); (onHost ?? onHome)() }}>{t('Запропонувати помешкання на HomeFU')}</a>
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
              {listing.rating !== null && <><Star size={14} fill="currentColor" aria-hidden /> {listing.rating.toFixed(2)} · {listing.reviewCount} {t('відгуків')} · </>}
              {listing.location}
            </p>
            <div className="property__meta-actions">
              <button type="button">
                <Share size={14} aria-hidden /> {t('Поділитися')}
              </button>
              <button
                type="button"
                className={`property__save-btn${isSaved ? ' property__save-btn--saved' : ''}`}
                onClick={() => onToggleSave?.(Number(listing.id))}
              >
                <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} aria-hidden /> {t(isSaved ? 'Збережено' : 'Зберегти')}
              </button>
            </div>
          </div>

          {/* Cover-фото и до четырёх дополнительных изображений. */}
          <div ref={galleryPreview} className="property__gallery">
            {listing.gallery?.length ? <>
              <button type="button" className="property__gallery-photo property__gallery-main" onClick={() => openGallery(0)} aria-label={t('Переглянути всі фотографії')}>
                <img src={listing.gallery[0]} alt={listing.title} />
              </button>
              <div className="property__gallery-grid">
                {listing.gallery.slice(1, 5).map((src, i) => (
                  <button key={`${src}-${i}`} type="button" className="property__gallery-photo" onClick={() => openGallery(i + 1)} aria-label={`${t('Переглянути всі фотографії')}, ${language === 'en' ? 'photo' : 'фото'} ${i + 2}`}>
                    <img src={src} alt={`${listing.title}, фото ${i + 2}`} />
                  </button>
                ))}
              </div>
            </> : (
              <p>{t('Для цього помешкання фотографії ще не додані.')}</p>
            )}
          </div>

          <h2 className="property__host-title">{t('Помешкання для оренди')}</h2>
          <p className="property__host-sub">{t('До гостей')} {listing.maxGuests}</p>

          <div className="property__divider" />

          <nav className="property__section-nav" aria-label={t('Розділи сторінки')}>
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`property__section-nav-item${activeSection === section.id ? ' property__section-nav-item--active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {t(section.label)}
              </a>
            ))}
          </nav>

          <section id="photos" className="property__section">
            {listing.description
              ? <p className="property__description">{listing.description}</p>
              : <p className="property__description">{t('Опис для цього помешкання ще не доданий.')}</p>}
          </section>

          <div className="property__divider" />

          <section id="amenities" className="property__section">
            <h2 className="property__section-title">{t('Які тут зручності')}</h2>
            {listing.amenities.length > 0 ? (
              <>
                <div className="property__amenities">
                  {listing.amenities.slice(0, AMENITIES_PREVIEW).map((amenity) => (
                    <div key={amenity.id} className="property__amenity">
                      <AmenityIcon icon={amenity.icon} />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
                {listing.amenities.length > AMENITIES_PREVIEW && (
                  <button
                    type="button"
                    className="property__outline-button"
                    onClick={() => setShowAllAmenities(true)}
                  >
                    {t('Показати всі зручності')} ({listing.amenities.length})
                  </button>
                )}
              </>
            ) : <p>{t('Інформація про зручності ще не додана.')}</p>}
            {showAllAmenities && (
              <div className="property__modal" role="dialog" aria-modal="true" onClick={() => setShowAllAmenities(false)}>
                <div className="property__modal-card" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="property__modal-close"
                    aria-label={t('Закрити')}
                    onClick={() => setShowAllAmenities(false)}
                  >×</button>
                  <h3>{t('Які тут зручності')}</h3>
                  <div className="property__modal-list">
                    {listing.amenities.map((amenity) => (
                      <div key={amenity.id} className="property__amenity">
                        <AmenityIcon icon={amenity.icon} />
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
            <h2 className="property__section-title">{t('Де ви будете')}</h2>
            <button type="button" className="property__map-preview-button" onClick={() => setShowMap(true)}>
              {locationMap}
            </button>
            <h3 className="property__location-title">{listing.location}</h3>
          </section>

          <div className="property__divider" />

          <section className="property__section">
            <h2 className="property__section-title">{t('Важлива інформація')}</h2>
            <p>{t('Максимальна кількість гостей:')} {listing.maxGuests}</p>
          </section>
        </main>

        <aside className="property__sidebar">
          <BookingWidget listing={listing} expanded onBook={onBook} dateRangeText={formatRange(stayDates.start, stayDates.end)} stayNights={stayNights} />
        </aside>
      </div>

      <footer className="property__footer">
        <span className="property__logo-inline">HomeFU</span>
        <span>{listing.location}</span>
        <a href="#support">{t('Підтримка')}</a>
      </footer>
    </div>
  )
}

export default function Buildingpage(props: BuildingpageProps) {
  // Публичная точка входа страницы объявления.
  return <PropertyDetail {...props} />
}
