import { ChevronLeft, Info, Globe, DollarSign } from 'lucide-react'
import type { Listing } from '../../types/listing'
import { UserMenu } from '../UserMenu/UserMenu'
import { PaymentMethodSection } from './PaymentMethodSection'
import { PaymentOptionSelector, type PaymentOption } from './PaymentOptionSelector'
import { PaymentSummary } from './PaymentSummary'
import { PaymentTripSection } from './PaymentTripSection'
import { formatPrice } from '../../utils/formatPrice'
import { useLanguage } from '../../i18n'
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
  const { language, t, setLanguage } = useLanguage()
  // Итоговая цена по той же формуле, что и на шаге бронирования.
  const totalPrice = listing.price * stayNights + 20
  const formatMoney = formatPrice

  return (
    <div className="payment">
      <button type="button" className="payment__back" onClick={onBack} aria-label={t('Назад')}>
        <ChevronLeft size={18} aria-hidden />
      </button>

      <header className="payment__header">
        <span className="payment__logo">HomeFU</span>
        <div className="payment__header-actions">
          <a className="payment__home-link" href="/" onClick={(event) => { event.preventDefault(); (onHost ?? onHome)() }}>{t('Запропонувати помешкання на HomeFU')}</a>
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
          <h1 className="payment__title">{t('Підтвердження й оплата')}</h1>

          <div className="payment__notice">
            <Info size={22} aria-hidden className="payment__notice-icon" />
            <div className="payment__notice-text">
              <h2>{t('Перевірте деталі помешкання')}</h2>
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
            <h2 className="payment__section-title">{t('Потрібно для подорожі')}</h2>

            <div className="payment__requirement">
              <h3>{t('Напишіть господарю')}</h3>
              <p>{t('Повідомте господаря про мету своєї подорожі та час прибуття.')}</p>
            </div>

            <div className="payment__requirement">
              <h3>{t('Фотографія профілю')}</h3>
              <p>{t('Господарі хочуть знати, хто гостюватиме в їхній оселі.')}</p>
            </div>

            <div className="payment__requirement">
              <h3>{t('Номер телефону')}</h3>
              <p>
                {t('Додайте й підтвердьте номер телефону, щоб отримувати новини про')} {t('подорож.')}
              </p>
            </div>
          </section>

          <div className="payment__divider" />

          <section className="payment__section">
            <h2 className="payment__section-title">{t('Правила скасування бронювання')}</h2>
            <p className="payment__policy-text">
              <strong>{t('Безкоштовне скасування бронювання до 30 груд..')}</strong>{t(' У разі скасування бронювання до прибуття 4 січ. вам повернуть частину коштів.')}
            </p>
            <a href="#more-cancellation" className="payment__policy-link">
              {t('Докладніше')}
            </a>
          </section>

          <div className="payment__divider" />

          <section className="payment__section">
            <h2 className="payment__section-title">{t('Основні правила')}</h2>
            <p className="payment__policy-text">
              {t('Ми просимо всіх мандрівників пам’ятати кілька простих правил належної поведінки гостя.')}
            </p>
            <ul className="payment__rules-list">
              <li>{t('Дотримуйтеся правил дому')}</li>
              <li>{t('Ставтеся до помешкання господаря як до власної оселі')}</li>
            </ul>
          </section>

          <div className="payment__divider" />

          <p className="payment__legal">
            {t('Натискаючи кнопку нижче, я приймаю умови')}{' '}
            <a href="#house-rules">{t('(Правила дому господаря,')}</a>{' '}
            <a href="#guest-standards">{t('Основні правила для гостей')}</a>,{' '}
            <a href="#refund-rules">{t('Правила повторного бронювання та повернення коштів HomeFU)')}</a>
            {t(', які HomeFU може застосовувати в разі моєї відповідальності за нанесення збитків (стягнути кошти відповідно до мого способу оплати).')}
          </p>

          {/* Связь кнопки с формой по id, несмотря на разное положение в DOM. */}
          <button type="submit" form="payment-form" className="payment__submit">
            {t('Підтвердити й оплатити')}
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
          <a href="#privacy">{t('Конфіденційність')}</a>
          <a href="#terms">{t('Умови')}</a>
          <a href="#sitemap">{t('Мапа сайту')}</a>
        </div>

        <div className="payment__footer-locale">
          <button type="button" onClick={() => setLanguage(language === 'uk' ? 'en' : 'uk')}>
            <Globe size={16} aria-hidden />
            <span>{language === 'en' ? 'English (US)' : 'Українська (UA)'}</span>
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
