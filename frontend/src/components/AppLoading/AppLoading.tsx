import { useLanguage } from '../../i18n'

export function AppLoading() {
  const { t } = useLanguage()
  return <div className="app-loading" role="status" aria-live="polite">{t('Завантаження…')}</div>
}
