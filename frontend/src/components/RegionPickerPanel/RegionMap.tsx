import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Координати центру та рівень зуму для кожного регіону України.
// zoom 9 дає баланс між деталізацією регіону та відсутністю зайвого шуму.
const REGION_COORDS: Record<string, { center: [number, number]; zoom: number }> = {
  // Автономна Республіка
  'АР Крим':                    { center: [45.05, 34.10], zoom: 8  },

  // Регіони за алфавітом
  'Вінницька область':          { center: [49.23, 28.47], zoom: 9  },
  'Волинська область':          { center: [50.75, 25.33], zoom: 9  },
  'Дніпропетровська область':   { center: [48.46, 35.04], zoom: 8  },
  'Донецька область':           { center: [48.00, 37.80], zoom: 8  },
  'Житомирська область':        { center: [50.25, 28.65], zoom: 9  },
  'Закарпатська область':       { center: [48.50, 22.80], zoom: 9  },
  'Запорізька область':         { center: [47.84, 35.14], zoom: 9  },
  'Івано-Франківська область':  { center: [48.70, 24.40], zoom: 9  },
  'Київська область':           { center: [50.30, 31.00], zoom: 9  },
  'Кіровоградська область':     { center: [48.51, 32.26], zoom: 9  },
  'Луганська область':          { center: [48.58, 39.31], zoom: 8  },
  'Львівська область':          { center: [49.84, 24.02], zoom: 9  },
  'Миколаївська область':       { center: [46.97, 31.99], zoom: 9  },
  'Одеська область':            { center: [46.30, 30.20], zoom: 8  },
  'Полтавська область':         { center: [49.59, 34.54], zoom: 9  },
  'Рівненська область':         { center: [50.62, 26.25], zoom: 9  },
  'Сумська область':            { center: [50.91, 34.80], zoom: 9  },
  'Тернопільська область':      { center: [49.55, 25.60], zoom: 9  },
  'Харківська область':         { center: [49.90, 36.50], zoom: 9  },
  'Херсонська область':         { center: [46.64, 32.62], zoom: 9  },
  'Хмельницька область':        { center: [49.42, 26.99], zoom: 9  },
  'Черкаська область':          { center: [49.44, 32.07], zoom: 9  },
  'Чернівецька область':        { center: [48.29, 25.94], zoom: 10 },
  'Чернігівська область':       { center: [51.30, 31.50], zoom: 8  },

  // Міста зі спеціальним статусом
  'Київ':                       { center: [50.45, 30.52], zoom: 11 },
  'Севастополь':                { center: [44.61, 33.52], zoom: 11 },
}

/** Fallback — центр України, якщо регіон невідомий. */
const UKRAINE_CENTER: [number, number] = [49.0, 32.0]

interface RegionMapProps {
  region: string
}

/**
 * Не-інтерактивна мініатюра карти для заданого регіону.
 * Використовує CartoDB Voyager — чистий, читабельний стиль без зайвих деталей.
 * Усі взаємодії вимкнені: карта є лише візуальним превью.
 */
export function RegionMap({ region }: RegionMapProps) {
  const config = REGION_COORDS[region]
  const center = config?.center ?? UKRAINE_CENTER
  const zoom   = config?.zoom   ?? 6

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
    >
      {/*
        Стандартні OpenStreetMap тайли — безплатні, без API-ключа.
        Той самий сервер, що використовує LocationMap у цьому проекті.
      */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains="abc"
      />
    </MapContainer>
  )
}
