import { lazy, Suspense } from 'react'
import type { ListingRegion } from '../../api/listings'
import { useLanguage } from '../../i18n'
import './RegionPickerPanel.css'

const RegionMap = lazy(() => import('./RegionMap').then((module) => ({ default: module.RegionMap })))

interface RegionPickerPanelProps {
  regions: ListingRegion[]
  onClose: () => void
  onSelectRegion?: (region: string) => void
}

export function RegionPickerPanel({ regions, onClose, onSelectRegion }: RegionPickerPanelProps) {
  const { t } = useLanguage()
  return (
    <div className="region-picker" role="dialog" aria-label={t('Пошук за регіонами')}>
      <div className="region-picker__title">{t('Пошук за регіонами')}</div>

      <div className="region-picker__grid">
        {/* Список регіонів із props; OSM-карта генерується автоматично за назвою регіону. */}
        {regions.map((region) => (
          <button
            key={region.name}
            type="button"
            className="region-picker__item"
            onClick={() => {
              onSelectRegion?.(region.name)
              onClose()
            }}
          >
            <span className="region-picker__map" aria-hidden="true">
              <Suspense fallback={<span className="region-picker__map-placeholder" />}>
                <RegionMap region={region} />
              </Suspense>
            </span>
            <span className="region-picker__label">{region.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
