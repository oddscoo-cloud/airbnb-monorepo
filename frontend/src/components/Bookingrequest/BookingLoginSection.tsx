import { useState, type FormEvent } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { Mail } from 'lucide-react'
import { apiRequest } from '../../api/http'
import { useLanguage } from '../../i18n'

type BookingLoginSectionProps = {
  onContinue: () => void
  onAuthenticated?: (email: string, role: string) => void
}

export function BookingLoginSection({ onContinue, onAuthenticated }: BookingLoginSectionProps) {
  const { t } = useLanguage()
  // Поля и состояние запроса формы входа на шаге бронирования.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    // Отправка credentials через общий API-клиент без перезагрузки страницы.
    event.preventDefault()
    setLoginError('')
    setIsSubmitting(true)

    try {
      const data = await apiRequest<{ access_token: string; role: string }>('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email, password }),
        fallbackError: () => t('Невірний логін або пароль'),
      })

      // Сохранение токена, обновление шапки и переход к следующему шагу.
      sessionStorage.setItem('access_token', data.access_token)
      onAuthenticated?.(email, data.role)
      onContinue()
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : t('Не вдалося увійти'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Обмен OAuth-токена через backend; обработка результата сессии пока не подключена.
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await apiRequest<unknown>('/api/auth/google', {
          method: 'POST',
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        })
      } catch (error) {
        console.error(error)
      }
    },
    onError: () => console.error('Google login failed'),
  })

  return (
    <section className="booking__section">
      <h2 className="booking__section-title booking__section-title--auth">
        {t('Увійдіть або зареєструйтеся, щоб зробити бронювання')}
      </h2>

      <form onSubmit={handleLoginSubmit}>
        <div className="booking__fieldset">
          <div className="booking__field">
            <span className="booking__field-label">Email</span>
            <input
              className="booking__field-input"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="booking__field">
            <span className="booking__field-label">{t('Пароль')}</span>
            <input
              className="booking__field-input"
              type="password"
              autoComplete="current-password"
              placeholder={t('Пароль')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
        </div>

        {loginError && (
          <p className="booking__phone-hint" style={{ color: '#8b1f1f', marginBottom: 16 }}>
            {loginError}
          </p>
        )}

        <button type="submit" className="booking__continue" disabled={isSubmitting}>
          {isSubmitting ? t('Вхід...') : t('Продовжити')}
        </button>
      </form>

      <div className="booking__or">
        <span />
        <span>{t('або')}</span>
        <span />
      </div>

      <div className="booking__social">
        <button type="button" className="booking__social-button" aria-label="Facebook">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path
              fill="#1877F2"
              d="M24 12a12 12 0 1 0-13.88 11.86v-8.39H7.08V12h3.04V9.36c0-3 1.78-4.66 4.51-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.39A12 12 0 0 0 24 12z"
            />
          </svg>
        </button>
        <button type="button" className="booking__social-button" aria-label="Google" onClick={() => googleLogin()}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path
              fill="#4285F4"
              d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.28-2.1 3.56-5.2 3.56-8.76z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.73-2.46 1.16-4.06 1.16-3.12 0-5.77-2.11-6.72-4.94H1.27v3.11A12 12 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.3A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.38-2.3V6.59H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.41l4.01-3.11z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.59l4.01 3.11C6.23 6.88 8.88 4.77 12 4.77z"
            />
          </svg>
        </button>
        <button type="button" className="booking__social-button" aria-label="Apple">
          <svg viewBox="0 0 21 24" width="18" height="20" aria-hidden>
            <path
              fill="#000000"
              d="M17.05 12.63c-.03-2.93 2.4-4.34 2.5-4.4-1.36-1.99-3.49-2.26-4.25-2.29-1.8-.19-3.53 1.07-4.45 1.07-.93 0-2.33-1.05-3.83-1.02-1.96.03-3.78 1.15-4.79 2.9-2.05 3.56-.52 8.83 1.46 11.72.98 1.42 2.13 3 3.66 2.94 1.48-.06 2.03-.95 3.82-.95 1.77 0 2.28.95 3.83.92 1.59-.03 2.58-1.44 3.55-2.87 1.11-1.64 1.57-3.24 1.6-3.32-.03-.02-3.06-1.18-3.1-4.7z"
            />
            <path
              fill="#000000"
              d="M14.53 4.13c.8-.98 1.35-2.32 1.2-3.67-1.16.05-2.58.78-3.41 1.75-.74.87-1.4 2.26-1.22 3.58 1.3.1 2.62-.66 3.43-1.66z"
            />
          </svg>
        </button>
      </div>

      <button type="button" className="booking__email-button">
        <Mail size={16} aria-hidden />
        <span>{t('Використати електронну пошту')}</span>
      </button>
    </section>
  )
}
