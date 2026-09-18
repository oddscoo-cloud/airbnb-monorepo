import { useState } from 'react'
import { Globe, DollarSign } from 'lucide-react'
import './Footer.css'

interface DestinationTab {
  id: string
  label: string
}

const TABS: DestinationTab[] = [
  { id: 'popular', label: 'Популярні' },
  { id: 'art-culture', label: 'Мистецтво й культура' },
  { id: 'outdoors', label: 'Відпочинок на відкритому повітрі' },
  { id: 'mountains', label: 'Гори' },
  { id: 'beach', label: 'Пляж' },
  { id: 'categories', label: 'Категорії' },
  { id: 'things-to-do', label: 'Чим займатися' },
]

interface Destination {
  id: string
  city: string
  type: string
}

const DESTINATIONS: Destination[] = [
  { id: '1', city: 'Canmore', type: 'Оренда квартир' },
  { id: '2', city: 'Бенальмадена', type: 'Оренда будинків' },
  { id: '3', city: 'Марбелья', type: 'Оренда будинків' },
  { id: '4', city: 'Мікос', type: 'Оренда квартир' },
  { id: '5', city: 'Prescott', type: 'Оренда зрубів' },
  { id: '6', city: 'Скоттсдейл', type: 'Оренда помешкань із бас…' },
  { id: '7', city: 'Тусон', type: 'Оренда кондомінімум' },
  { id: '8', city: 'Захер', type: 'Помешкання для відпоч…' },
  { id: '9', city: 'Маунтін-Б\'ю', type: 'Оренда будинків' },
  { id: '10', city: 'Девонпорт', type: 'Помешкання для відпоч…' },
  { id: '11', city: 'Моллокоота', type: 'Помешкання для відпоч…' },
  { id: '12', city: 'Ейвісса', type: 'Помешкання для відпоч…' },
  { id: '13', city: 'Анахайм', type: 'Оренда помешкань для дл…' },
  { id: '14', city: 'Монтерей', type: 'Помешкання для відпоч…' },
  { id: '15', city: 'Paso Robles', type: 'Помешкання для відпоч…' },
  { id: '16', city: 'Санта-Барбара', type: 'Оренда заміських буд…' },
  { id: '17', city: 'Сонома', type: 'Помешкання для відпоч…' },
]

const SUPPORT_LINKS = [
  'Довідковий центр',
  'AirCover',
  'Пропозиції дискримінації',
  'Підтримка людей з інвалідністю',
  'Варіанти скасування бронювання',
  'Надіслати скаргу від сусідів',
]

const HOSTING_LINKS = [
  'Переоформіть помешкання на HomeFU',
  'AirCover для господарів',
  'Ресурси про прийом гостей',
  'Форум спільноти',
  'Відповідальний прийом гостей',
]

const COMPANY_LINKS = ['Новини', 'Нові функції', 'Вакансії', 'Інвестори', 'Помешкання від HomeFU']

export function Footer() {
  const [activeTab, setActiveTab] = useState('popular')

  return (
    <>
      <section className="destinations" aria-label="Ідеї для майбутніх поїздок">
        <h2 className="destinations__title">Ідеї для майбутніх поїздок</h2>

        <div className="destinations__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`destinations__tab${activeTab === tab.id ? ' destinations__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="destinations__grid">
          {DESTINATIONS.map((destination) => (
            <a key={destination.id} className="destinations__item" href="#">
              <span className="destinations__city">{destination.city}</span>
              <span className="destinations__type">{destination.type}</span>
            </a>
          ))}
          <button type="button" className="destinations__more">
            Показати більше
          </button>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__columns">
          <div className="site-footer__column">
            <h3>Підтримка</h3>
            <ul>
              {SUPPORT_LINKS.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__column">
            <h3>Прийом гостей</h3>
            <ul>
              {HOSTING_LINKS.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__column">
            <h3>HomeFU</h3>
            <ul>
              {COMPANY_LINKS.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <div className="site-footer__legal">
            <span>2022 HomeFU, Inc.</span>
            <a href="#">Конфіденційність</a>
            <a href="#">Умови</a>
            <a href="#">Мапа сайту</a>
          </div>

          <div className="site-footer__locale">
            <button type="button" className="site-footer__locale-item">
              <Globe size={16} aria-hidden />
              <span>Українська (UA)</span>
            </button>
            <button type="button" className="site-footer__locale-item">
              <DollarSign size={16} aria-hidden />
              <span>USD</span>
            </button>
            {/* <a href="#" aria-label="Facebook" className="site-footer__social">
              <Facebook size={16} aria-hidden />
            </a>
            <a href="#" aria-label="Instagram" className="site-footer__social">
              <Instagram size={16} aria-hidden />
            </a> */}
          </div>
        </div>
      </footer>
    </>
  )
}
