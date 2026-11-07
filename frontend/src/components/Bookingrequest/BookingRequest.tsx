import { ChevronLeft, Info, Globe, DollarSign } from 'lucide-react'
import type { Listing } from '../../types/listing'
import { UserMenu } from '../UserMenu/UserMenu'
import { BookingLoginSection } from './BookingLoginSection'
import { BookingPaymentOptions } from './BookingPaymentOptions'
import { BookingSummary } from './BookingSummary'
import { formatPrice } from '../../utils/formatPrice'
import { useLanguage } from '../../i18n'
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
  onOpenProfile,
  onOpenAdmin,
  onHost,
  onOpenSignIn,
  onOpenRegister,
  onLogout,
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
  onOpenProfile?: () => void
  onOpenAdmin?: () => void
  onHost?: () => void
  onOpenSignIn?: () => void
  onOpenRegister?: () => void
  onLogout?: () => void
}) {
  const { language, t } = useLanguage()
  // Общая сумма с фиксированной платой за уборку, без отдельного расчёта налогов.
  const totalPrice = listing.price * stayNights + 20
  const formatMoney = formatPrice
  // Отображение диапазона из общего состояния App.
  const dateRangeText = stayDates.start
    ? `${new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(stayDates.start)}${stayDates.end ? ` — ${new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(stayDates.end)}` : ''}`
    : t('Дати не обрано')

  return (
    <div className="booking">
      <button type="button" className="booking__back" onClick={onBack} aria-label={t('Назад')}>
        <ChevronLeft size={18} aria-hidden />
      </button>

      <header className="booking__header">
        <span className="booking__logo">HomeFU</span>
        <div className="booking__header-actions">
          <a className="booking__home-link" href="/" onClick={(event) => { event.preventDefault(); (onHost ?? onHome)() }}>{t('Запропонувати помешкання на HomeFU')}</a>
          <UserMenu
            onOpenProfile={onOpenProfile}
            onOpenSaved={onOpenProfile}
            onOpenAdmin={onOpenAdmin}
            onSignIn={onOpenSignIn}
            onRegister={onOpenRegister}
            onLogout={onLogout}
          />
        </div>
      </header>

      <div className="booking__layout">
        <main className="booking__main">
          <h1 className="booking__title">{t('Запит на бронювання')}</h1>

          <div className="booking__notice">
            <Info size={22} aria-hidden className="booking__notice-icon" />
            <div className="booking__notice-text">
              <h2>{t('Перевірте деталі помешкання')}</h2>
              <p>{listing.title}</p>
            </div>
          </div>

          <section className="booking__section">
            <h2 className="booking__section-title">{t('Ваша подорож')}</h2>

            <div className="booking__trip-row">
              <div>
                <h3>{t('Дати')}</h3>
                <p>{dateRangeText}</p>
              </div>
              <button type="button" className="booking__edit-link" onClick={onEditDates}>
                {t('Редагувати')}
              </button>
            </div>

            <div className="booking__divider" />

            <div className="booking__trip-row">
              <div>
                <h3>{t('Гості')}</h3>
                <p>{t('До')} {listing.maxGuests} {t('гостей')}</p>
              </div>
              <button type="button" className="booking__edit-link" onClick={onEditGuests}>
                {t('Редагувати')}
              </button>
            </div>
          </section>

          {/* Способ оплаты из общего состояния App. */}
          <BookingPaymentOptions
            paymentOption={paymentOption}
            totalPrice={totalPrice}
            formatMoney={formatMoney}
            onPaymentOptionChange={onPaymentOptionChange}
          />

          {/* Продолжение сценария после успешного входа. */}
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
          <a href="#privacy">{t('Конфіденційність')}</a>
          <a href="#terms">{t('Умови')}</a>
          <a href="#sitemap">{t('Мапа сайту')}</a>
        </div>

        <div className="booking__footer-locale">
          <button type="button">
            <Globe size={16} aria-hidden />
            <span>{language === 'en' ? 'English (US)' : 'Українська (UA)'}</span>
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
