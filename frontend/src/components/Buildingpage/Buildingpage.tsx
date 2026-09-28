import { useState } from 'react'
import {
  Search,
  Menu,
  User,
  Share,
  Heart,
  Star,
  Wifi,
  UtensilsCrossed,
  Tv,
  BedDouble,
  ArrowUpDown,
  WashingMachine,
  ParkingSquare,
  Fan,
  Flag,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react'
import type { Listing } from '../CategoryListings/CategoryListings'
import { LocationMap } from '../Map/LocationMap'
import './Buildingpage.css'

const GALLERY = {
  main: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
  thumbs: [
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=500&q=80',
  ],
}

const HIGHLIGHTS = [
  {
    title: 'Окреме робоче місце',
    desc: 'Зона спільного користування з Wi-Fi, яка добре підходить для роботи.',
  },
  {
    title: 'Самостіне прибуття',
    desc: 'Самостійне прибуття за допомогою ключа в сейфі.',
  },
  {
    title: 'Безкоштовне скасування бронювання до 30 грудня',
    desc: null as string | null,
  },
]

const AMENITIES_PREVIEW = [
  { icon: UtensilsCrossed, label: 'Кухня' },
  { icon: BedDouble, label: 'Окреме місце для сну' },
  { icon: Wifi, label: 'Wi-Fi' },
  {
    icon: Tv,
    label:
      'Телевізор HDTV з 32-дюймовим екраном та стандартне кабельне ТБ, Netflix, преміальне кабельне підключення.',
  },
]

const AMENITIES_FULL = [
  { icon: ArrowUpDown, label: 'Ліфт' },
  { icon: Fan, label: 'Портативна система кондиціонування' },
  { icon: WashingMachine, label: 'Пральна та сушильна машина' },
  { icon: UtensilsCrossed, label: 'Укомплектована кухня' },
  { icon: ParkingSquare, label: 'Паркінг' },
  { icon: Fan, label: 'Фен' },
]

const RATING_CATEGORIES = [
  { label: 'Чистота', value: '4,9' },
  { label: 'Точність', value: '4,9' },
  { label: 'Комунікація', value: '5,0' },
  { label: 'Розташування', value: '4,9' },
  { label: 'Ціна/Якість', value: '4,9' },
]

const REVIEWS = [
  { name: 'Oleksandr', text: 'Однозначно рекомендую, все було на високому рівні )' },
  {
    name: 'Дарина',
    text: 'Дуже дякую за гарні апартаменти! Дуже близько до пляжу, а сама квартира просто вау!',
  },
  {
    name: 'Дарья',
    text: "Всі фото відповідають дійсності. Вид з вікна просто неймовірний! Розташування дуже зручне, 2 хвилини пішки до моря і до траси здоров\u2018я.",
  },
  {
    name: 'Даниил',
    text: 'Все пройшло чудово! Місцерозташування квартири, саме житло та господар - 5 зірок! Рекомендую.',
  },
  {
    name: 'Сергей',
    text: "Все було чудово! Дар\u02bcя завжди готова допомогти! Вид з вікна окремий вид задоволення.",
  },
  {
    name: 'Sveta',
    text: 'Дуже гарна квартира і дуже гарна господиня. Прекрасний вид на найкраще в світі море !!!! Це відпочинок для душі !!! Даша, дуже дуже вам дякую за все.',
  },
]

const HOUSE_RULES = ['Прибуття: після 13:00', 'Виїзд: після 10:00', 'Максимальна кількість гостей: 4']
const SAFETY_RULES = ['Датчик диму', 'Датчик чадного газу']

const SECTIONS = [
  { id: 'photos', label: 'Фотографії' },
  { id: 'amenities', label: 'Зручності' },
  { id: 'reviews', label: 'Відгуки' },
  { id: 'location', label: 'Розташування' },
]

const MONTHS = [
  { label: 'Листопад 2023', year: 2023, month: 10, disabledThrough: 10 },
  { label: 'Грудень 2023', year: 2023, month: 11, disabledThrough: 0 },
]

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7 // понедельник — первый день недели
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(startOffset).fill(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  return cells
}

function BookingWidget({
  expanded = false,
  onBook,
  dateRangeText,
}: {
  expanded?: boolean
  onBook?: () => void
  dateRangeText?: string
}) {
  return (
    <div className="property__widget">
      <div className="property__widget-top">
        <span className="property__widget-price">$63</span>
        <span className="property__widget-night">ніч</span>
        <span className="property__widget-rating">
          <Star size={12} fill="currentColor" aria-hidden /> 4,95 ·{' '}
          <a href="#reviews">35 відгуків</a>
        </span>
      </div>

      <div className="property__widget-dates">
        <div className="property__widget-dates-row">
          <div>
            <span className="property__widget-label">ПРИБУТТЯ</span>
            <span>{dateRangeText ? dateRangeText.split(' — ')[0] ?? '04.01.2024' : '04.01.2024'}</span>
          </div>
          <div>
            <span className="property__widget-label">ВИЇЗД</span>
            <span>{dateRangeText ? dateRangeText.split(' — ')[1] ?? '09.01.2024' : '09.01.2024'}</span>
          </div>
        </div>
        <div className="property__widget-divider" />
        <div className="property__widget-guests">
          <span className="property__widget-label">ГОСТІ</span>
          <span>1 гість</span>
        </div>
      </div>

      <button type="button" className="property__widget-submit" onClick={onBook}>
        Забронювати
      </button>

      {expanded ? (
        <>
          <div className="property__widget-price-row">
            <a href="#nights">$63 х 5 ночей</a>
            <span>$ 315</span>
          </div>
          <div className="property__widget-price-row">
            <a href="#cleaning">Плата за прибирання</a>
            <span>$ 20</span>
          </div>
          <div className="property__widget-divider" />
          <div className="property__widget-price-row property__widget-price-row--total">
            <span>Усього до сплати податків</span>
            <span>$ 335</span>
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
  const [selectedStart, setSelectedStart] = useState<Date | null>(new Date(2024, 0, 4))
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(new Date(2024, 0, 9))

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

  if (showMap) {
    return <LocationMap onBack={() => setShowMap(false)} />
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
          <h1 className="property__title">{listing.category} в {listing.location}</h1>

          <div className="property__meta-row">
            <p className="property__meta">{listing.rating} · 35 відгуків · {listing.location}</p>
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
            <img className="property__gallery-main" src={GALLERY.main} alt="Помешкання" />
            <div className="property__gallery-grid">
              {GALLERY.thumbs.map((src, i) => (
                <img key={i} src={src} alt={`Фото помешкання ${i + 2}`} />
              ))}
            </div>
          </div>

          <h2 className="property__host-title">Помешкання для оренди, господар - Ілона</h2>
          <p className="property__host-sub">4 гостя, 1 спальня, 2 ліжка, 1 ванна кімната</p>

          <div className="property__divider" />

          <div className="property__highlights">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="property__highlight">
                <span className="property__highlight-dot" />
                <div>
                  <h3>{item.title}</h3>
                  {item.desc && <p>{item.desc}</p>}
                </div>
              </div>
            ))}
          </div>

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
            <p className="property__translate">
              Деякі дані перекладено автоматично.{' '}
              <a href="#original">Показати мовою оригіналу.</a>
            </p>
            <p className="property__description">
              Вона оснащена кондиціонером і безкоштовним Wi-Fi. Ви можете відпочити на затишній
              терасі, насолоджуючись видом на море. Квартира розміром 24 метри з повністю
              обладнаною кухнею з мікрохвильовою пічю, вітальнею, телевізором з плоским екраном,
              власною ванною кімнатою з пральною машиною, феном. Є холодильник, плита, чайник.
              Спальне місце - двоспальне ліжко. На території комплексу розташовані магазин,
              аптека, кав'ярня та інші сервіси, поруч...
            </p>
            <a href="#full-description" className="property__link-bold">
              Показати більше
            </a>

            <div className="property__divider" />

            <a href="#sleeping" className="property__link-bold property__section-heading">
              Місце для сну
            </a>
            <div className="property__sleeping">
              <img
                className="property__sleeping-image"
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80"
                alt="Спальня"
              />
              <div>
                <h3>Спальня</h3>
                <p>1 ліжко king-size</p>
              </div>
            </div>
          </section>

          <div className="property__divider" />

          <section id="amenities" className="property__section">
            <h2 className="property__section-title">Які тут зручності</h2>
            <div className="property__amenities">
              {AMENITIES_PREVIEW.map((item) => (
                <div key={item.label} className="property__amenity">
                  <item.icon size={22} aria-hidden />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="property__amenities">
              {AMENITIES_FULL.map((item) => (
                <div key={item.label} className="property__amenity">
                  <item.icon size={22} aria-hidden />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <button type="button" className="property__outline-button">
              Показати всі зручності (10)
            </button>
          </section>

          <div className="property__divider" />

          <section className="property__section">
            <h2 className="property__section-title">Одеса : 5 ночей</h2>
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
            <h2 className="property__section-title">5,0 · 35 відгуків</h2>

            <div className="property__rating-categories">
              {RATING_CATEGORIES.map((cat) => (
                <div key={cat.label} className="property__rating-category">
                  <span>{cat.label}</span>
                  <span>{cat.value}</span>
                </div>
              ))}
            </div>

            <div className="property__reviews">
              {REVIEWS.map((review) => (
                <div key={review.name} className="property__review">
                  <div className="property__review-avatar">{review.name[0]}</div>
                  <div>
                    <h3>{review.name}</h3>
                    <p>{review.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="property__outline-button">
              Показати всі 35 відгуків
            </button>
          </section>

          <div className="property__divider" />

          <section id="location" className="property__section">
            <h2 className="property__section-title">Де ви будете</h2>
            <button type="button" className="property__map-preview" onClick={() => setShowMap(true)}>
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=60"
                alt="Карта розташування"
              />
              <span className="property__map-pin">HFU</span>
            </button>
            <h3 className="property__location-title">Одеса, Одеська область, Україна</h3>
            <p className="property__location-sub">
              Перша лінія біля моря, Аркадія, Французький бульвар
            </p>
            <a href="#more-location" className="property__link-bold">
              Показати більше
            </a>
          </section>

          <div className="property__divider" />

          <section className="property__section">
            <div className="property__host-card">
              <div className="property__host-avatar">І</div>
              <div>
                <h2>Господар: Ілона</h2>
                <p>
                  35 відгуків · Верифікований користувач
                  <br />
                  <span className="property__host-since">
                    На <span className="property__logo-inline">HomeFU</span> з листопада 2017
                  </span>
                </p>
              </div>
            </div>

            <h3 className="property__subsection-title">Під час подорожі</h3>
            <p className="property__host-detail">Будьте на зв'язку, коли у вас виникнуть запитання</p>
            <p className="property__host-detail">Мови: English, Українська</p>
            <p className="property__host-detail">Швидкість відповіді: 100%</p>
            <p className="property__host-detail">Час відповіді: протягом години</p>

            <button type="button" className="property__outline-button">
              <MessageCircle size={16} aria-hidden /> Зв'язатись з господарем
            </button>

            <p className="property__safety-note">
              <ShieldAlert size={14} aria-hidden /> Щоб захистити свою оплату, ніколи не
              переказуйте кошти та не спілкуйтеся за межами веб-сайту чи застосунку{' '}
              <span className="property__logo-inline">HomeFU</span>.
            </p>
          </section>

          <div className="property__divider" />

          <section className="property__section">
            <h2 className="property__section-title">Важлива інформація</h2>

            <div className="property__rules-columns">
              <div>
                <h3>Правила дому</h3>
                <ul>
                  {HOUSE_RULES.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3>Правила безпеки в помешканні</h3>
                <ul>
                  {SAFETY_RULES.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3>Правила скасування бронювання</h3>
                <p>
                  Безкоштовне скасування бронювання до 30 грудня. Перегляньте повні правила
                  скасування бронювання, які застосовуються, навіть якщо ви скасовуєте бронювання
                  через хворобу або обмеження подорожей через COVID-19.
                </p>
              </div>
            </div>
          </section>
        </main>

        <aside className="property__sidebar">
          <BookingWidget expanded onBook={onBook} dateRangeText={formatRange(selectedStart, selectedEnd)} />
        </aside>
      </div>

      <footer className="property__footer">
        <span className="property__logo-inline">HomeFU</span>
        <span>Україна · Odesa Oblast · Odesa</span>
        <a href="#support">Підтримка</a>
      </footer>
    </div>
  )
}

export default function Buildingpage(props: BuildingpageProps) {
  return <PropertyDetail {...props} />
}
