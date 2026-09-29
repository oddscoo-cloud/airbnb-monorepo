import { useState, type FormEvent } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { ChevronLeft, Info, Star, Mail, Globe, DollarSign } from 'lucide-react'
import type { Listing } from '../CategoryListings/CategoryListings'
import './BookingRequest.css'

type PaymentOption = 'full' | 'split'

export function BookingRequest({
  listing,
  onBack,
  onContinue,
  onAuthenticated,
  onEditDates,
  onEditGuests,
}: {
  listing: Listing
  onBack: () => void
  onContinue: () => void
  onAuthenticated?: (email: string) => void
  onEditDates?: () => void
  onEditGuests?: () => void
}) {
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'Невірний логін або пароль')
      }

      sessionStorage.setItem('access_token', data.access_token)
      onAuthenticated?.(email)
      onContinue()
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Не вдалося увійти')
    } finally {
      setIsSubmitting(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        })

        if (!response.ok) throw new Error('Google auth failed')
        await response.json()
      } catch (error) {
        console.error(error)
      }
    },
    onError: () => console.error('Google login failed'),
  })

  return (
    <div className="booking">
      <button type="button" className="booking__back" onClick={onBack} aria-label="Назад">
        <ChevronLeft size={18} aria-hidden />
      </button>

      <header className="booking__header">
        <span className="booking__logo">HomeFU</span>
      </header>

      <div className="booking__layout">
        <main className="booking__main">
          <h1 className="booking__title">Запит на бронювання</h1>

          <div className="booking__notice">
            <Info size={22} aria-hidden className="booking__notice-icon" />
            <div className="booking__notice-text">
              <h2>Перевірте деталі помешкання</h2>
              <p>{listing.title}</p>
            </div>
          </div>

          <section className="booking__section">
            <h2 className="booking__section-title">Ваша подорож</h2>

            <div className="booking__trip-row">
              <div>
                <h3>Дати</h3>
                <p>Дати не обрано</p>
              </div>
              <button type="button" className="booking__edit-link" onClick={onEditDates}>
                Редагувати
              </button>
            </div>

            <div className="booking__divider" />

            <div className="booking__trip-row">
              <div>
                <h3>Гості</h3>
                <p>До {listing.maxGuests} гостей</p>
              </div>
              <button type="button" className="booking__edit-link" onClick={onEditGuests}>
                Редагувати
              </button>
            </div>
          </section>

          <section className="booking__section">
            <h2 className="booking__section-title">Виберіть варіант оплати</h2>

            <div className="booking__payment-options">
              <label
                className={`booking__payment-option${paymentOption === 'full' ? ' booking__payment-option--active' : ''}`}
              >
                <div>
                  <h3>Оплатити в повному обсязі</h3>
                  <p>Сплатіть усю суму ($335,00) одразу.</p>
                </div>
                <span className="booking__radio" aria-hidden="true">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentOption === 'full'}
                    onChange={() => setPaymentOption('full')}
                    aria-label="Оплатити в повному обсязі"
                  />
                </span>
              </label>

              <label
                className={`booking__payment-option${paymentOption === 'split' ? ' booking__payment-option--active' : ''}`}
              >
                <div>
                  <h3>Оплата двома частинами</h3>
                  <p>
                    $65,60 потрібно оплатити сьогодні, $262,40 - 22груд.2023р…
                    <br />
                    Жодних додаткових зборів. <a href="#more">Докладніше</a>
                  </p>
                </div>
                <span className="booking__radio" aria-hidden="true">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentOption === 'split'}
                    onChange={() => setPaymentOption('split')}
                    aria-label="Оплата двома частинами"
                  />
                </span>
              </label>
            </div>
          </section>

          <section className="booking__section">
            <h2 className="booking__section-title booking__section-title--auth">
              Увійдіть або зареєструйтеся, щоб зробити бронювання
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
                  <span className="booking__field-label">Пароль</span>
                  <input
                    className="booking__field-input"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Пароль"
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
                {isSubmitting ? 'Вхід...' : 'Продовжити'}
              </button>
            </form>

            <div className="booking__or">
              <span />
              <span>або</span>
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
              <span>Використати електронну пошту</span>
            </button>
          </section>
        </main>

        <aside className="booking__summary">
          <div className="booking__summary-card">
            <img
              className="booking__summary-image"
              src={listing.image}
              alt="Помешкання"
            />
            <div className="booking__summary-body">
              <p className="booking__summary-desc">
                {listing.location}
                <br />
                {listing.title}
              </p>
              {listing.rating !== null && <p className="booking__summary-rating">
                <Star size={12} fill="currentColor" aria-hidden /> {listing.rating.toFixed(2)} ·{' '}
                <a href="#reviews">{listing.reviewCount} відгуків</a>
              </p>}
            </div>
          </div>

          <div className="booking__divider" />

          <h2 className="booking__summary-title">Детальніше про ціну</h2>

          <div className="booking__price-row">
            <span>${listing.price},00 х 5 ночей</span>
            <span>${listing.price * 5},00</span>
          </div>
          <div className="booking__price-row">
            <a href="#cleaning-fee">Плата за прибирання</a>
            <span>$20,00</span>
          </div>

          <div className="booking__divider" />

          <div className="booking__price-row booking__price-row--total">
            <span>Усього <a href="#usd">(USD)</a></span>
            <span>${listing.price * 5 + 20},00</span>
          </div>
        </aside>
      </div>

      <footer className="booking__footer">
        <div className="booking__footer-legal">
          <span>2022 HomeFU, Inc.</span>
          <a href="#privacy">Конфіденційність</a>
          <a href="#terms">Умови</a>
          <a href="#sitemap">Мапа сайту</a>
        </div>

        <div className="booking__footer-locale">
          <button type="button">
            <Globe size={16} aria-hidden />
            <span>Українська (UA)</span>
          </button>
          <button type="button">
            <DollarSign size={16} aria-hidden />
            <span>USD</span>
          </button>
          {/* <a href="#facebook" aria-label="Facebook">
            <Facebook size={16} aria-hidden />
          </a>
          <a href="#instagram" aria-label="Instagram">
            <Instagram size={16} aria-hidden />
          </a> */}
        </div>
      </footer>
    </div>
  )
}
