import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import './LocationMap.css'

// Координаты объекта — на реальном проекте приходят из БД вместе с объявлением.
// Здесь — примерные координаты района Аркадія, Одеса (под макет).
const LISTING_LOCATION: [number, number] = [46.4362, 30.7371]

const pinIcon = L.divIcon({
  html: renderToStaticMarkup(<div className="location-map__pin">HFU</div>),
  className: 'location-map__pin-wrapper',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

// react-leaflet не даёт готового пропа "показать/скрыть слой" на лету — приходится
// управлять слоем императивно через инстанс карты (useMap), поэтому вынесено в
// отдельный компонент-помощник, который ничего не рендерит сам.
function TransitLayerToggle({ enabled }: { enabled: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!enabled) return

    // Публичного бесплатного слоя общественного транспорта в стиле Google Maps
    // у OpenStreetMap нет "из коробки" — здесь просто пример подключения стороннего
    // тайл-слоя (Thunderforest Transit). Для реальной работы нужен свой бесплатный
    // API-ключ на thunderforest.com (тоже без привязки карты).
    const transitLayer = L.tileLayer(
      'https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=YOUR_THUNDERFOREST_KEY',
      { opacity: 0.9 },
    )
    transitLayer.addTo(map)

    return () => {
      map.removeLayer(transitLayer)
    }
  }, [map, enabled])

  return null
}

interface LocationMapProps {
  onBack: () => void
}

export function LocationMap({ onBack }: LocationMapProps) {
  const [showTransit, setShowTransit] = useState(false)

  return (
    <div className="location-map">
      <a
        href="#back"
        className="location-map__back"
        onClick={(event) => {
          event.preventDefault()
          onBack()
        }}
      >
        <ChevronLeft size={20} aria-hidden />
      </a>

      <div className="location-map__layout">
        <aside className="location-map__sidebar">
          <h1>Де ви будете</h1>

          <section>
            <h2>Одеса, Одеська область, Україна</h2>
            <p>Перша лінія біля моря, Аркадія, Французький бульвар</p>
          </section>

          <section>
            <h2>Пересування містом</h2>
            <p>
              У разі необхідності на території є паркінг, зробіть запит
              заздалегідь. Безкоштовний паркінг на Французькому бульварі.
            </p>
          </section>
        </aside>

        <div className="location-map__map">
          <MapContainer
            center={LISTING_LOCATION}
            zoom={14}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <TransitLayerToggle enabled={showTransit} />

            <Marker position={LISTING_LOCATION} icon={pinIcon}>
              <Popup>Точне розташування буде повідомлено після бронювання.</Popup>
            </Marker>
          </MapContainer>

          <label className="location-map__transit-toggle">
            <input
              type="checkbox"
              checked={showTransit}
              onChange={(event) => setShowTransit(event.target.checked)}
            />
            <span>Громадський транспорт</span>
          </label>
        </div>
      </div>
    </div>
  )
}
