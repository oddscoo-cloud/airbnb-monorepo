import { Map } from 'lucide-react'
import './ShowMapButton.css'

interface ShowMapButtonProps {
  onClick?: () => void
}

export function ShowMapButton({ onClick }: ShowMapButtonProps) {
  // Callback родительского компонента для открытия карты.
  return (
    <button type="button" className="show-map-button" onClick={onClick}>
      <Map size={16} aria-hidden />
      <span>Показати мапу</span>
    </button>
  )
}
