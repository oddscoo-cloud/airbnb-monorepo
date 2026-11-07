import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './RegisterModal.css'
import { useGoogleLogin } from '@react-oauth/google'
import { apiRequest } from '../../api/http'
import { useLanguage } from '../../i18n'

const MAX_LENGTH = 50

interface RegisterModalProps {
  onClose: () => void
  onAuthenticated: (email: string, role: string) => void
}

export function RegisterModal({ onClose, onAuthenticated }: RegisterModalProps) {
  const { t } = useLanguage()
  // Обмен Google OAuth-токена; синхронизация профиля App в этом callback не подключена.
  const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      await apiRequest<unknown>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ access_token: tokenResponse.access_token }),
      })
      onClose()
    } catch (err) {
      console.error(err)
    }
  },
  onError: () => console.error('Google login failed'),
  })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Локальная проверка пароля перед запросом регистрации.
    event.preventDefault()
    setError('')

    if (password !== repeatPassword) {
      setError(t('Пароли не совпадают'))
      return
    }

    setIsSubmitting(true)
    try {
      const data = await apiRequest<{ role?: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          confirm_password: repeatPassword,
        }),
        fallbackError: () => t('Не удалось зарегистрироваться'),
      })

      // Передача данных пользователя в App и закрытие диалога после регистрации.
      onAuthenticated(email, data.role ?? 'Guest')
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('Не удалось зарегистрироваться'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Закрытие по клику на overlay; изоляция кликов внутри диалога.
  return createPortal(
    <div className="register-modal__overlay" role="presentation" onClick={onClose}>
      <div
        className="register-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="register-modal__close"
          aria-label={t('Закрити')}
          onClick={onClose}
        >
          <X size={18} aria-hidden />
        </button>

        <h2 id="register-modal-title" className="register-modal__title">
          Register
        </h2>

        <form className="register-modal__form" onSubmit={handleSubmit}>
          <div className="register-modal__field">
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <p className="register-modal__hint">
            We will send you an email to confirm your{' '}
            <a href="#confirm-email">email address</a>
          </p>

          <div className="register-modal__field register-modal__field--counted">
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              maxLength={MAX_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <span className="register-modal__counter">
              {password.length}/{MAX_LENGTH}
            </span>
          </div>

          <div className="register-modal__field register-modal__field--counted">
            <input
              id="register-repeat-password"
              name="repeatPassword"
              type="password"
              placeholder="Repeat password"
              autoComplete="new-password"
              maxLength={MAX_LENGTH}
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
            />
            <span className="register-modal__counter">
              {repeatPassword.length}/{MAX_LENGTH}
            </span>
          </div>

          <p className="register-modal__legal">
            *Get acquainted with our <a href="#privacy-policy">Privacy policy</a>
          </p>

          <button type="submit" className="register-modal__submit">
            {isSubmitting ? t('Регистрация...') : 'Continue'}
          </button>
          {error && <p className="register-modal__error" role="alert">{error}</p>}
        </form>

        <div className="register-modal__social">
          <button type="button" className="register-modal__social-button" onClick={() => googleLogin()}>
            <svg viewBox="0 0 24 24" width="23" height="24" aria-hidden>
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
            <span>Sign In with Google</span>
          </button>

          <button type="button" className="register-modal__social-button"
                      onClick={() => {
                          window.location.assign('/api/facebook-auth/login')
                      }}
                  >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
              <path
                fill="#1877F2"
                d="M24 12a12 12 0 1 0-13.88 11.86v-8.39H7.08V12h3.04V9.36c0-3 1.78-4.66 4.51-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.39A12 12 0 0 0 24 12z"
              />
            </svg>
            <span>Sign In with Facebook</span>
          </button>

          <button type="button" className="register-modal__social-button">
            <svg viewBox="0 0 21 24" width="21" height="24" aria-hidden>
              <path
                fill="#000000"
                d="M17.05 12.63c-.03-2.93 2.4-4.34 2.5-4.4-1.36-1.99-3.49-2.26-4.25-2.29-1.8-.19-3.53 1.07-4.45 1.07-.93 0-2.33-1.05-3.83-1.02-1.96.03-3.78 1.15-4.79 2.9-2.05 3.56-.52 8.83 1.46 11.72.98 1.42 2.13 3 3.66 2.94 1.48-.06 2.03-.95 3.82-.95 1.77 0 2.28.95 3.83.92 1.59-.03 2.58-1.44 3.55-2.87 1.11-1.64 1.57-3.24 1.6-3.32-.03-.02-3.06-1.18-3.1-4.7z"
              />
              <path
                fill="#000000"
                d="M14.53 4.13c.8-.98 1.35-2.32 1.2-3.67-1.16.05-2.58.78-3.41 1.75-.74.87-1.4 2.26-1.22 3.58 1.3.1 2.62-.66 3.43-1.66z"
              />
            </svg>
            <span>Sign In with Apple</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
