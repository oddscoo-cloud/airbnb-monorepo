import { useState } from 'react';
import { Menu } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Listing } from '../CategoryListings/CategoryListings';
import 'leaflet/dist/leaflet.css';
import './Buildingpage.css';

const styles = new Proxy({} as Record<string, string>, {
  get: (_, prop) => (typeof prop === 'string' ? prop : ''),
});

const img = {
  hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
  bedroom: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80',
  map: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80',
  reviewer1: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
  reviewer2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  reviewer3: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80',
  reviewer4: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
  reviewer5: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=200&q=80',
  reviewer6: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
};

const LISTING_LOCATION: [number, number] = [46.4362, 30.7371];

const mapPinIcon = L.divIcon({
  html: renderToStaticMarkup(<div className="location-map__pin">HFU</div>),
  className: 'location-map__pin-wrapper',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

/* ------------------------------------------------------------------ *
 * Иконки (воссозданы вручную по образу иконок макета — line-style,
 * т.к. точные векторные пути Figma не были доступны для скачивания)
 * ------------------------------------------------------------------ */
const StarIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
    <path d="M8 1l2.06 4.18L14.5 5.8l-3.25 3.17L12 13.4 8 11.2l-4 2.2.75-4.43L1.5 5.8l4.44-.62L8 1z" fill="#211E1A" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <circle cx="10.5" cy="10.5" r="6" stroke="#211E1A" strokeWidth="1.5" />
    <path d="M20 20l-4.5-4.5" stroke="#211E1A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const WorkspaceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <rect x="3" y="4" width="18" height="12" rx="1.5" stroke="#211E1A" strokeWidth="1.4" />
    <path d="M8 20h8M12 16v4" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <circle cx="8" cy="8" r="4" stroke="#211E1A" strokeWidth="1.4" />
    <path d="M11 11l9 9M17 17l2-2M14 14l2-2" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const CalendarCancelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="#211E1A" strokeWidth="1.4" />
    <path d="M3 9h18M8 3v4M16 3v4M9 14l6 6M15 14l-6 6" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const BedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6M3 18v2M21 18v2M3 13V8" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="7" cy="10" r="1.4" stroke="#211E1A" strokeWidth="1.2" />
  </svg>
);

const KitchenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="M5 3v8M9 3v8M5 7h4M12 21V9c3 0 5 2 5 5v7" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const WifiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="M2 9c5.5-5 14.5-5 20 0M5.5 13c3.6-3.2 9.4-3.2 13 0M9 17c1.6-1.4 4.4-1.4 6 0" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="12" cy="20" r="1.2" fill="#211E1A" />
  </svg>
);

const TvIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <rect x="3" y="5" width="18" height="12" rx="1.5" stroke="#211E1A" strokeWidth="1.4" />
    <path d="M8 21h8" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const ElevatorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <rect x="4" y="3" width="16" height="18" rx="1.5" stroke="#211E1A" strokeWidth="1.4" />
    <path d="M10 9l-2 2 2 2M14 9l2 2-2 2" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const AcIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <rect x="2" y="6" width="20" height="6" rx="2" stroke="#211E1A" strokeWidth="1.4" />
    <path d="M6 16v3M12 16v4M18 16v3" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const DryerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#211E1A" strokeWidth="1.4" />
    <circle cx="12" cy="13" r="4" stroke="#211E1A" strokeWidth="1.4" />
    <path d="M7 7h.01" stroke="#211E1A" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ParkingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="#211E1A" strokeWidth="1.4" />
    <path d="M9 17V7h3.5a2.75 2.75 0 010 5.5H9" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const SmokeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <circle cx="12" cy="12" r="9" stroke="#211E1A" strokeWidth="1.4" />
    <circle cx="12" cy="12" r="3" stroke="#211E1A" strokeWidth="1.4" />
  </svg>
);

const CoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <circle cx="12" cy="12" r="9" stroke="#211E1A" strokeWidth="1.4" />
    <path d="M8 12h8M12 8v8" stroke="#211E1A" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/* ------------------------------------------------------------------ */

const RatingBar = ({ label, value }: { label: string; value: number }) => (
  <div className={styles.ratingBarRow}>
    <span className={styles.ratingBarLabel}>{label}</span>
    <div className={styles.ratingBarTrack}>
      <div className={styles.ratingBarFill} style={{ width: `${(value / 5) * 100}%` }} />
    </div>
    <span className={styles.ratingBarValue}>{value.toFixed(1).replace('.', ',')}</span>
  </div>
);

type Review = {
  name: string;
  avatar: string;
  text: string;
};

const reviews: Review[] = [
  {
    name: 'Oleksandr',
    avatar: img.reviewer1,
    text: 'Однозначно рекомендую, все було на високому рівні )',
  },
  {
    name: 'Дарина',
    avatar: img.reviewer2,
    text: 'Дуже дякую за гарні апартаменти! Дуже близько до пляжу, а сама квартира просто вау!',
  },
  {
    name: 'Дарья',
    avatar: img.reviewer3,
    text: 'Всі фото відповідають дійсності. Вид з вікна просто неймовірний! Розташування дуже зручне, 2 хвилини пішки до моря і до траси здоров\u2018я.',
  },
  {
    name: 'Даниил',
    avatar: img.reviewer4,
    text: 'Все пройшло чудово! Місцерозташування квартири, саме житло та господар - 5 зірок! Рекомендую.',
  },
  {
    name: 'Сергей',
    avatar: img.reviewer5,
    text: 'Все було чудово! Дар\u02bcя завжди готова допомогти! Вид з вікна окремий вид задоволення.',
  },
  {
    name: 'Sveta',
    avatar: img.reviewer6,
    text: 'Дуже гарна квартира і дуже гарна господиня. Прекрасний вид на найкраще в світі море !!!! Це відпочинок для душі !!! Даша, дуже дуже вам дякую за все.',
  },
];

const dow = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function BookingCard({
  compact = false,
  price,
  rating,
  onBook,
}: {
  compact?: boolean;
  price: number;
  rating: number;
  onBook: () => void;
}) {
  return (
    <div className={styles.bookingCard}>
      <div className={styles.bookingPriceRow}>
        <span className={styles.bookingPrice}>${price}</span>
        <span className={styles.bookingPerNight}>ніч</span>
        <span className={styles.bookingRating}>
          <StarIcon />
          {rating.toFixed(2).replace('.', ',')} . <u>35 відгуків</u>
        </span>
      </div>

      <div className={styles.bookingFields}>
        <div className={styles.bookingFieldsTop}>
          <div className={styles.bookingField}>
            <p className={styles.bookingFieldLabel}>ПРИБУТТЯ</p>
            <p className={styles.bookingFieldValue}>04.01.2024</p>
          </div>
          <div className={styles.bookingField}>
            <p className={styles.bookingFieldLabel}>ВИЇЗД</p>
            <p className={styles.bookingFieldValue}>09.01.2024</p>
          </div>
        </div>
        <div className={styles.bookingField}>
          <p className={styles.bookingFieldLabel}>ГОСТІ</p>
          <p className={styles.bookingFieldValue}>1 гість</p>
        </div>
      </div>

      <button type="button" className={styles.bookNowBtn} onClick={onBook}>
        Забронювати
      </button>
      <p className={styles.bookingNote}>Поки що ви нічого не платите</p>

      {!compact && (
        <>
          <div className={styles.bookingBreakdown}>
            <div className={`${styles.bookingBreakdownRow} ${styles.underline}`}>
              <span>${price} х 5 ночей</span>
              <span>$ {price * 5}</span>
            </div>
            <div className={`${styles.bookingBreakdownRow} ${styles.underline}`}>
              <span>Плата за прибирання</span>
              <span>$ 20</span>
            </div>
            <div className={`${styles.bookingBreakdownRow} ${styles.total}`}>
              <span>Усього до сплати податків</span>
              <span>$ {price * 5 + 20}</span>
            </div>
          </div>
          <a href="#" className={styles.reportLink}>
            Поскаржитись на це оголошення
          </a>
        </>
      )}
    </div>
  );
}

export interface ZhitloPageProps {
  listing: Listing;
  onBack: () => void;
  onBook: () => void;
  onOpenSignIn?: () => void;
  onOpenRegister?: () => void;
}

const calendarMonthData = [
  { month: 10, year: 2023, label: 'Листопад 2023' },
  { month: 11, year: 2023, label: 'Грудень 2023' },
];

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const padding = (firstDay.getDay() + 6) % 7;
  const cells: Array<number | null> = [];

  for (let index = 0; index < padding; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function ZhitloPage({ listing, onBack, onBook, onOpenSignIn, onOpenRegister }: ZhitloPageProps) {
  const galleryImages = listing.gallery && listing.gallery.length >= 5
    ? listing.gallery
    : [listing.image, listing.image, listing.image, listing.image, listing.image];
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: new Date(2023, 10, 19),
    end: new Date(2023, 10, 24),
  });

  const rangeStart = dateRange.start;
  const rangeEnd = dateRange.end;

  const selectedDateLabel = rangeStart && rangeEnd
    ? `${formatDate(rangeStart)} — ${formatDate(rangeEnd)}`
    : 'Виберіть дати';

  const handleDayClick = (date: Date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setDateRange({ start: date, end: null });
      return;
    }

    if (date.getTime() < rangeStart.getTime()) {
      setDateRange({ start: date, end: rangeStart });
      return;
    }

    setDateRange({ start: rangeStart, end: date });
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <header className={styles.header}>
          <button type="button" className={styles.logo} onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            HomeFU
          </button>
          <button type="button" className={styles.searchBar}>
            <span>Почніть пошук</span>
            <span className={styles.searchIcon}>
              <SearchIcon />
            </span>
          </button>
          <div className={styles.headerRight}>
            <a href="#" className={styles.hostLink}>
              Запропонувати помешкання на HomeFU
            </a>
            <div className="site-header__account">
              <button
                type="button"
                className="site-header__menu"
                aria-expanded={isUserMenuOpen}
                aria-label="Меню користувача"
                onClick={() => setIsUserMenuOpen((value) => !value)}
              >
                <Menu size={16} aria-hidden="true" />
                {isLoggedIn ? (
                  <span className="site-header__avatar" aria-hidden="true">
                    A
                  </span>
                ) : (
                  <span className="site-header__avatar site-header__avatar--empty" aria-hidden="true" />
                )}
              </button>

              {isUserMenuOpen && (
                <div className="site-header__account-menu" role="menu">
                  {isLoggedIn ? (
                    <button type="button" role="menuitem" onClick={() => { setIsLoggedIn(false); setIsUserMenuOpen(false); }}>
                      Вийти
                    </button>
                  ) : (
                    <>
                      <button type="button" role="menuitem" onClick={() => {
                        setIsUserMenuOpen(false)
                        onOpenSignIn?.()
                      }}>
                        Увійти
                      </button>
                      <button type="button" role="menuitem" onClick={() => {
                        setIsUserMenuOpen(false)
                        onOpenRegister?.()
                      }}>
                        Реєстрація
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Title */}
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{listing.location} · {listing.category}</h1>
          <p className={styles.metaLine}>{listing.rating.toFixed(2).replace('.', ',')} . 35 відгуків . {listing.location}</p>
        </div>

        {/* Gallery */}
        <div className={styles.gallery}>
          <a className={styles.galleryMain} href="#">
            <img src={galleryImages[0]} alt="Загальний вигляд помешкання" />
          </a>
          <div className={styles.gallerySmall}>
            <img src={galleryImages[1]} alt="Кухня" />
          </div>
          <div className={styles.gallerySmall}>
            <img src={galleryImages[2]} alt="Вітальня" />
          </div>
          <div className={styles.gallerySmall}>
            <img src={galleryImages[3]} alt="Спальня" />
          </div>
          <div className={styles.gallerySmall}>
            <img src={galleryImages[4]} alt="Ванна кімната" />
          </div>
        </div>

        {/* Overview + booking */}
        <div className={styles.overviewRow}>
          <div className={styles.overviewLeft}>
            <div className={styles.hostRow}>
              <div className={styles.hostInfo}>
                <div>
                  <h2 className={styles.hostName}>Помешкання для оренди, господар - Ілона</h2>
                  <p className={styles.guestsLine}>4 гостя, 1 спальня, 2 ліжка, 1 ванна кімната</p>
                </div>
              </div>
              <img src={img.hostAvatar} alt="Ілона" className={styles.hostAvatar} />
            </div>

            <hr className={styles.divider} />

            <div className={styles.highlights}>
              <div className={styles.highlightItem}>
                <span className={styles.highlightIcon}>
                  <WorkspaceIcon />
                </span>
                <div>
                  <p className={styles.highlightTitle}>Окреме робоче місце</p>
                  <p className={styles.highlightText}>
                    Зона спільного користування з Wi-Fi, яка добре підходить для роботи.
                  </p>
                </div>
              </div>
              <div className={styles.highlightItem}>
                <span className={styles.highlightIcon}>
                  <KeyIcon />
                </span>
                <div>
                  <p className={styles.highlightTitle}>Самостіне прибуття</p>
                  <p className={styles.highlightText}>Самостійне прибуття за допомогою ключа в сейфі.</p>
                </div>
              </div>
              <div className={styles.highlightItem}>
                <span className={styles.highlightIcon}>
                  <CalendarCancelIcon />
                </span>
                <div>
                  <p className={styles.highlightTitle}>Безкоштовне скасування бронювання до 30 грудня</p>
                </div>
              </div>
            </div>

            <hr className={styles.divider} />

            <nav className={styles.tabsRow}>
              <button type="button">Фотографії</button>
              <button type="button">Зручності</button>
              <button type="button">Відгуки</button>
              <button type="button">Розташування</button>
            </nav>
          </div>

          <aside className={styles.bookingAside}>
            <BookingCard price={listing.price} rating={listing.rating} onBook={onBook} />
          </aside>
        </div>
      </div>

      <hr className={styles.sectionFullDivider} />

      <div className={styles.inner}>
        {/* Description */}
        <section className={styles.section}>
          <p className={styles.description}>
            {`Вона оснащена кондиціонером і безкоштовним Wi-Fi. Ви можете відпочити на затишній терасі, насолоджуючись видом на море. Квартира розміром 24 метри з повністю обладнаною кухнею з мікрохвильовою пічю, вітальнею, телевізором з плоским екраном, власною ванною кімнатою з пральною машиною, феном. Є холодильник, плита, чайник. Спальне місце - двоспальне ліжко. На території комплексу розташовані магазин, аптека, кав\u2019ярня та інші сервіси, поруч...`}
          </p>
          <button type="button" className={styles.showMoreBtn}>
            Показати більше
          </button>
          <p className={styles.translateNote}>
            Деякі дані перекладено автоматично. <u>Показати мовою оригіналу.</u>
          </p>
        </section>
      </div>

      <div className={styles.inner}>
        {/* Sleeping place */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle} style={{ marginBottom: 24 }}>
            Місце для сну
          </h3>
          <div className={styles.sleepGrid}>
            <div className={styles.sleepCard}>
              <img src={img.bedroom} alt="Спальня" />
              <p className={styles.sleepCardTitle}>Спальня</p>
              <p className={styles.sleepCardText}>1 ліжко king-size</p>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.inner}>
        {/* Amenities preview */}
        <section className={styles.sectionWide}>
          <h3 className={styles.sectionTitle}>Які тут зручності</h3>
          <div className={styles.amenitiesGrid}>
            <div className={styles.amenityItem}>
              <span className={styles.amenityIcon}>
                <BedIcon />
              </span>
              <span className={styles.amenityText}>Окреме місце для сну</span>
            </div>
            <div className={styles.amenityItem}>
              <span className={styles.amenityIcon}>
                <TvIcon />
              </span>
              <span className={styles.amenityText}>
                Телевізор HDTV з 32-дюймовим екраном та стандартне кабельне ТБ, Netflix, преміальне кабельне
                підключення.
              </span>
            </div>
            <div className={styles.amenityItem}>
              <span className={styles.amenityIcon}>
                <KitchenIcon />
              </span>
              <span className={styles.amenityText}>Кухня</span>
            </div>
            <div className={styles.amenityItem}>
              <span className={styles.amenityIcon}>
                <ElevatorIcon />
              </span>
              <span className={styles.amenityText}>Ліфт</span>
            </div>
            <div className={styles.amenityItem}>
              <span className={styles.amenityIcon}>
                <WifiIcon />
              </span>
              <span className={styles.amenityText}>Wi-Fi</span>
            </div>
            <div className={styles.amenityItem}>
              <span className={styles.amenityIcon}>
                <AcIcon />
              </span>
              <span className={styles.amenityText}>Портативна система кондиціонування</span>
            </div>
            <div className={styles.amenityItem}>
              <span className={styles.amenityIcon}>
                <DryerIcon />
              </span>
              <span className={styles.amenityText}>Пральна та сушильна машина</span>
            </div>
            <div className={styles.amenityItem}>
              <span className={styles.amenityIcon}>
                <DryerIcon />
              </span>
              <span className={styles.amenityText}>Фен</span>
            </div>
            <div className={styles.amenityItem}>
              <span className={styles.amenityIcon}>
                <ParkingIcon />
              </span>
              <span className={styles.amenityText}>Паркінг</span>
            </div>
          </div>
          <button type="button" className={styles.showAllBtn}>
            Показати всі зручності (10)
          </button>
        </section>
      </div>

      <div className={styles.inner}>
        {/* Calendar */}
        <section className={styles.sectionWide}>
          <div className={styles.calendarHeaderRow}>
            <h3 className={styles.sectionTitle}>Одеса : 5 ночей</h3>
          </div>
          <p className={styles.calendarDates}>19 лист.2023р. — 24лист.2023</p>

          <p className={styles.calendarDates}>{selectedDateLabel}</p>

          <div className={styles.calendarMonths}>
            {calendarMonthData.map(({ month, year, label }) => {
              const gridDays = buildMonthGrid(year, month);

              return (
                <div className={styles.calendarMonth} key={label}>
                  <p className={styles.calendarMonthTitle}>{label}</p>
                  <div className={styles.calendarGrid}>
                    {dow.map((d) => (
                      <span key={`${label}-${d}`} className={styles.calendarDow}>
                        {d}
                      </span>
                    ))}

                    {gridDays.map((day, index) => {
                      if (day === null) {
                        return <span key={`${label}-empty-${index}`} className={`${styles.calendarDay} ${styles.emptyDay}`} />;
                      }

                      const date = new Date(year, month, day);
                      const isSelected = rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd;
                      const isStart = rangeStart && date.getTime() === rangeStart.getTime();
                      const isEnd = rangeEnd && date.getTime() === rangeEnd.getTime();

                      return (
                        <button
                          type="button"
                          key={`${label}-${day}`}
                          className={`${styles.calendarDay} ${isSelected ? styles.inRange : ''} ${isStart || isEnd ? styles.selected : ''}`}
                          onClick={() => handleDayClick(date)}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.clearDatesRow}>
            <button type="button" onClick={() => setDateRange({ start: null, end: null })}>Очистити дати</button>
          </div>
        </section>
      </div>

      <div className={styles.inner}>
        {/* Reviews */}
        <section className={styles.sectionWide}>
          <div className={styles.reviewsSummary}>
            <StarIcon />
            <span className={styles.reviewsScore}>5,0</span>
            <span className={styles.reviewsCount}>35 відгуків</span>
          </div>

          <div className={styles.ratingBars}>
            <RatingBar label="Чистота" value={4.9} />
            <RatingBar label="Точність" value={4.9} />
            <RatingBar label="Комунікація" value={5.0} />
            <RatingBar label="Розташування" value={4.9} />
            <RatingBar label="Ціна/Якість" value={4.9} />
          </div>

          <div className={styles.reviewsGrid}>
            {reviews.map((r) => (
              <div className={styles.reviewCard} key={r.name}>
                <div className={styles.reviewAuthor}>
                  <img src={r.avatar} alt={r.name} className={styles.reviewAvatar} />
                  <p className={styles.reviewAuthorName}>{r.name}</p>
                </div>
                <p className={styles.reviewText}>{r.text}</p>
              </div>
            ))}
          </div>

          <div className={styles.showAllReviewsRow}>
            <button type="button" className={styles.showAllBtn}>
              Показати всі 35 відгуків
            </button>
          </div>
        </section>
      </div>

      <div className={styles.inner}>
        {/* Location */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Де ви будете</h3>
          <div className={styles.mapWrap}>
            <MapContainer
              center={LISTING_LOCATION}
              zoom={14}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={LISTING_LOCATION} icon={mapPinIcon}>
                <Popup>Точне розташування буде повідомлено після бронювання.</Popup>
              </Marker>
            </MapContainer>
          </div>
          <p className={styles.locationAddress}>Одеса, Одеська область, Україна</p>
          <p className={styles.locationText}>Перша лінія біля моря, Аркадія, Французький бульвар</p>
          <button type="button" className={styles.showMoreBtn}>
            Показати більше
          </button>
        </section>
      </div>

      <div className={styles.inner}>
        {/* Host */}
        <section className={styles.sectionWide}>
          <div className={styles.hostCardRow}>
            <img src={img.hostAvatar} alt="Ілона" className={styles.hostCardAvatar} />
            <div>
              <p className={styles.hostCardName}>Господар: Ілона</p>
              <p className={styles.hostCardMeta}>
                35 відгуків &nbsp;·&nbsp; Верифікований користувач
              </p>
              <p className={styles.hostCardMeta}>
                <small>
                  На <span className={styles.serifWord}>HomeFU</span> з листопада 2017
                </small>
              </p>
            </div>
          </div>

          <div className={styles.contactSection}>
            <p className={styles.rulesItem}>Будьте на зв’язку, коли у вас виникнуть запитання</p>
            <p className={styles.rulesItem}>Мови: English, Українська</p>
            <p className={styles.rulesItem}>Швидкість відповіді: 100%</p>
            <p className={styles.rulesItem} style={{ marginBottom: 24 }}>
              Швидкість відповіді: протягом години
            </p>

            <p className={styles.contactTitle}>Зв’язатись з господарем</p>
            <button type="button" className={styles.contactBtn}>
              Зв’язатись з господарем
            </button>

            <p className={styles.safetyNote}>
              Щоб захистити свою оплату, ніколи не переказуйте кошти та не спілкуйтеся за межами веб-сайту чи
              застосунку <span className={styles.serifWord}>HomeFU</span>.
            </p>
          </div>
        </section>
      </div>

      <div className={styles.inner}>
        {/* House rules */}
        <section className={styles.sectionWide}>
          <h3 className={styles.sectionTitle}>Важлива інформація</h3>
          <div className={styles.rulesGrid}>
            <div className={styles.rulesCol}>
              <p className={styles.rulesColTitle}>Правила дому</p>
              <p className={styles.rulesItem}>Прибуття: після 13:00</p>
              <p className={styles.rulesItem}>Виїзд: після 10:00</p>
              <p className={styles.rulesItem}>Максимальна кількість гостей: 4</p>
            </div>
            <div className={styles.rulesCol}>
              <p className={styles.rulesColTitle}>Правила безпеки в помешканні</p>
              <div className={styles.amenityItem}>
                <SmokeIcon />
                <p className={styles.rulesItem}>Датчик диму</p>
              </div>
              <div className={styles.amenityItem}>
                <CoIcon />
                <p className={styles.rulesItem}>Датчик чадного газу</p>
              </div>
            </div>
            <div className={styles.rulesCol}>
              <p className={styles.rulesColTitle}>Правила скасування бронювання</p>
              <p className={styles.rulesItem}>Безкоштовне скасування бронювання до 30 грудня</p>
              <p className={styles.rulesItemLong}>
                Перегляньте повні правила скасування бронювання, які застосовуються, навіть якщо ви скасовуєте
                бронювання через хворобу або обмеження подорожей через COVID-19.
              </p>
            </div>
          </div>
        </section>
      </div>

      <hr className={styles.sectionFullDivider} />

      <div className={styles.inner}>
        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerBreadcrumbs}>
            <span className={styles.footerLogo}>HomeFU</span>
            <span>Україна</span>
            <span className={styles.footerDot} />
            <span>Odesa Oblast</span>
            <span className={styles.footerDot} />
            <span>Odesa</span>
          </div>
          <a href="#" className={styles.footerSupport}>
            Підтримка
          </a>
        </footer>
      </div>
    </div>
  );
}
