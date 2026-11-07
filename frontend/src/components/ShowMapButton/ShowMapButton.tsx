import { Map } from 'lucide-react'
import { useLanguage } from '../../i18n'
import './ShowMapButton.css'

interface ShowMapButtonProps {
  onClick?: () => void
}

export function ShowMapButton({ onClick }: ShowMapButtonProps) {
  const { t } = useLanguage()
  // Callback родительского компонента для открытия карты.
  return (
    <button type="button" className="show-map-button" onClick={onClick}>
      <Map size={16} aria-hidden />
      <span>{t('Показати мапу')}</span>
    </button>
  )
}
