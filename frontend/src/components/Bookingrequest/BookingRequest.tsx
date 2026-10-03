import { ChevronLeft, Info, Globe, DollarSign } from 'lucide-react'
import type { Listing } from '../../types/listing'
import { BookingLoginSection } from './BookingLoginSection'
import { BookingPaymentOptions } from './BookingPaymentOptions'
import { BookingSummary } from './BookingSummary'
import './BookingRequest.css'

type PaymentOption = 'full' | 'split'

export function BookingRequest({
  listing,
  stayDates,
  stayNights,
  paymentOption,
  onPaymentOptionChange,
  onBack,
  onHome,
  onContinue,
  onAuthenticated,
  onEditDates,
  onEditGuests,
}: {
  listing: Listing
  stayDates: { start: Date | null; end: Date | null }
  stayNights: number
  paymentOption: PaymentOption
  onPaymentOptionChange: (option: PaymentOption) => void
  onBack: () => void
  onHome: () => void
  onContinue: () => void
  onAuthenticated?: (email: string, role: string) => void
  onEditDates?: () => void
  onEditGuests?: () => void
}) {
  const totalPrice = listing.price * stayNights + 20
  const formatMoney = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const dateRangeText = stayDates.start
    ? `${new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(stayDates.start)}${stayDates.end ? ` — ${new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(stayDates.end)}` : ''}`
    : 'Дати не обрано'

  return (
    <div className="booking">
      <button type="button" className="booking__back" onClick={onBack} aria-label="Назад">
        <ChevronLeft size={18} aria-hidden />
      </button>

      <header className="booking__header">
        <span className="booking__logo">HomeFU</span>
        <a className="booking__home-link" href="/" onClick={(event) => { event.preventDefault(); onHome() }}>Запропонувати помешкання на HomeFU</a>
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
                <p>{dateRangeText}</p>
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

          <BookingPaymentOptions
            paymentOption={paymentOption}
            totalPrice={totalPrice}
            formatMoney={formatMoney}
            onPaymentOptionChange={onPaymentOptionChange}
          />

          <BookingLoginSection onContinue={onContinue} onAuthenticated={onAuthenticated} />
        </main>

        <BookingSummary
          listing={listing}
          stayNights={stayNights}
          totalPrice={totalPrice}
          formatMoney={formatMoney}
        />
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
        </div>
      </footer>
    </div>
  )
}
