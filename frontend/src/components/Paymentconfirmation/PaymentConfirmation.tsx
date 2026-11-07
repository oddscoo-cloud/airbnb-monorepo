import { ChevronLeft, Info, Globe, DollarSign } from 'lucide-react'
import type { Listing } from '../../types/listing'
import { UserMenu } from '../UserMenu/UserMenu'
import { PaymentMethodSection } from './PaymentMethodSection'
import { PaymentOptionSelector, type PaymentOption } from './PaymentOptionSelector'
import { PaymentSummary } from './PaymentSummary'
import { PaymentTripSection } from './PaymentTripSection'
import { formatPrice } from '../../utils/formatPrice'
import './PaymentConfirmation.css'

export function PaymentConfirmation({
  listing,
  stayDates,
  stayNights,
  paymentOption,
  onPaymentOptionChange,
  onBack,
  onHome,
  onPaid,
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
  onPaid: () => void
  onOpenProfile?: () => void
  onOpenAdmin?: () => void
  onHost?: () => void
  onOpenSignIn?: () => void
  onOpenRegister?: () => void
  onLogout?: () => void
}) {
  // Итоговая цена по той же формуле, что и на шаге бронирования.
  const totalPrice = listing.price * stayNights + 20
  const formatMoney = formatPrice

  return (
    <div className="payment">
      <button type="button" className="payment__back" onClick={onBack} aria-label="Назад">
        <ChevronLeft size={18} aria-hidden />
      </button>

      <header className="payment__header">
        <span className="payment__logo">HomeFU</span>
        <div className="payment__header-actions">
          <a className="payment__home-link" href="/" onClick={(event) => { event.preventDefault(); (onHost ?? onHome)() }}>Запропонувати помешкання на HomeFU</a>
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

      <div className="payment__layout">
        <main className="payment__main">
          <h1 className="payment__title">Підтвердження й оплата</h1>

          <div className="payment__notice">
            <Info size={22} aria-hidden className="payment__notice-icon" />
            <div className="payment__notice-text">
              <h2>Перевірте деталі помешкання</h2>
              <p>{listing.title}</p>
            </div>
          </div>

          {/* Экранные подразделы в отдельных компонентах. */}
          <PaymentTripSection listing={listing} stayDates={stayDates} />

          <div className="payment__divider" />

          <PaymentOptionSelector
            totalPrice={totalPrice}
            paymentOption={paymentOption}
            onPaymentOptionChange={onPaymentOptionChange}
            formatMoney={formatMoney}
          />

          {/* Демонстрационное подтверждение без запроса к платёжному API. */}
          <PaymentMethodSection onPaid={onPaid} />

          <div className="payment__divider" />

          <section className="payment__section">
            <h2 className="payment__section-title">Потрібно для подорожі</h2>

            <div className="payment__requirement">
              <h3>Напишіть господарю</h3>
              <p>Повідомте господаря про мету своєї подорожі та час прибуття.</p>
            </div>

            <div className="payment__requirement">
              <h3>Фотографія профілю</h3>
              <p>Господарі хочуть знати, хто гостюватиме в їхній оселі.</p>
            </div>

            <div className="payment__requirement">
              <h3>Номер телефону</h3>
              <p>
                Додайте й підтвердьте номер телефону, щоб отримувати новини про
                подорож.
              </p>
            </div>
          </section>

          <div className="payment__divider" />

          <section className="payment__section">
            <h2 className="payment__section-title">Правила скасування бронювання</h2>
            <p className="payment__policy-text">
              <strong>Безкоштовне скасування бронювання до 30 груд..</strong> У разі
              скасування бронювання до прибуття 4 січ. вам повернуть частину коштів.
            </p>
            <a href="#more-cancellation" className="payment__policy-link">
              Докладніше
            </a>
          </section>

          <div className="payment__divider" />

          <section className="payment__section">
            <h2 className="payment__section-title">Основні правила</h2>
            <p className="payment__policy-text">
              Ми просимо всіх мандрівників пам&rsquo;ятати кілька простих правил
              належної поведінки гостя.
            </p>
            <ul className="payment__rules-list">
              <li>Дотримуйтеся правил дому</li>
              <li>Ставтеся до помешкання господаря як до власної оселі</li>
            </ul>
          </section>

          <div className="payment__divider" />

          <p className="payment__legal">
            Натискаючи кнопку нижче, я приймаю умови{' '}
            <a href="#house-rules">(Правила дому господаря,</a>{' '}
            <a href="#guest-standards">Основні правила для гостей</a>,{' '}
            <a href="#refund-rules">Правила повторного бронювання та повернення коштів HomeFU)</a>
            , які HomeFU може застосовувати в разі моєї відповідальності за нанесення
            збитків (стягнути кошти відповідно до мого способу оплати).
          </p>

          {/* Связь кнопки с формой по id, несмотря на разное положение в DOM. */}
          <button type="submit" form="payment-form" className="payment__submit">
            Підтвердити й оплатити
          </button>
        </main>

        <PaymentSummary
          listing={listing}
          stayNights={stayNights}
          totalPrice={totalPrice}
          formatMoney={formatMoney}
        />
      </div>

      <footer className="payment__footer">
        <div className="payment__footer-legal">
          <span>2022 HomeFU, Inc.</span>
          <a href="#privacy">Конфіденційність</a>
          <a href="#terms">Умови</a>
          <a href="#sitemap">Мапа сайту</a>
        </div>

        <div className="payment__footer-locale">
          <button type="button">
            <Globe size={16} aria-hidden />
            <span>Українська (UA)</span>
          </button>
          <button type="button">
            <DollarSign size={16} aria-hidden />
            <span>USD</span>
          </button>
          <a href="#facebook" aria-label="Facebook">
            f
          </a>
          <a href="#instagram" aria-label="Instagram">
            ig
          </a>
        </div>
      </footer>
    </div>
  )
}
