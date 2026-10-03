import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { useEffect } from 'react'
import type { Listing } from '../../types/listing'
import 'leaflet/dist/leaflet.css'
import './LocationMap.css'

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
  listings: Listing[]
  onBack: () => void
}

function FitListingsBounds({ listings }: { listings: Listing[] }) {
  const map = useMap()

  useEffect(() => {
    const locations = listings
      .filter((listing) => listing.latitude !== 0 && listing.longitude !== 0)
      .map((listing) => [listing.latitude, listing.longitude] as [number, number])

    if (locations.length) map.fitBounds(locations, { padding: [32, 32], maxZoom: 14 })
  }, [listings, map])

  return null
}

export function LocationMap({ listings, onBack }: LocationMapProps) {
  const [showTransit, setShowTransit] = useState(false)
  const locatedListings = listings.filter((listing) => listing.latitude !== 0 && listing.longitude !== 0)
  const initialCenter: [number, number] = locatedListings.length
    ? [locatedListings[0].latitude, locatedListings[0].longitude]
    : [0, 0]

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
          <h1>Помешкання на мапі</h1>
          <section>
            <h2>{locatedListings.length} помешкань із координатами</h2>
            {!locatedListings.length && <p>Для оголошень ще не вказані координати.</p>}
          </section>
        </aside>

        <div className="location-map__map">
          <MapContainer
            center={initialCenter}
            zoom={locatedListings.length ? 10 : 2}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <TransitLayerToggle enabled={showTransit} />
            <FitListingsBounds listings={locatedListings} />

            {locatedListings.map((listing) => (
              <Marker key={listing.id} position={[listing.latitude, listing.longitude]} icon={pinIcon}>
                <Popup>{listing.title} · ${listing.price} / ніч</Popup>
              </Marker>
            ))}
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
