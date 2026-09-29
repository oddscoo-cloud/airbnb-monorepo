import { Map } from 'lucide-react'
import './ShowMapButton.css'

interface ShowMapButtonProps {
  onClick?: () => void
}

export function ShowMapButton({ onClick }: ShowMapButtonProps) {
  return (
    <button type="button" className="show-map-button" onClick={onClick}>
      <Map size={16} aria-hidden />
      <span>Показати мапу</span>
    </button>
  )
}
