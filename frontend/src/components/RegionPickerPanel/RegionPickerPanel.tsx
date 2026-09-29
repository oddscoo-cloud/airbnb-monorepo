import './RegionPickerPanel.css'

interface RegionPickerPanelProps {
  regions: string[]
  onClose: () => void
  onSelectRegion?: (region: string) => void
}

export function RegionPickerPanel({ regions, onClose, onSelectRegion }: RegionPickerPanelProps) {
  return (
    <div className="region-picker" role="dialog" aria-label="Пошук за регіонами">
      <div className="region-picker__title">Пошук за регіонами</div>

      <div className="region-picker__grid">
        {regions.map((region) => (
          <button
            key={region}
            type="button"
            className="region-picker__item"
            onClick={() => {
              onSelectRegion?.(region)
              onClose()
            }}
          >
            <span className="region-picker__map" aria-hidden="true" />
            <span>{region}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
