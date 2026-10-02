import { useState, type FormEvent } from 'react'
import {
  ChevronLeft,
  Info,
  Star,
  CreditCard,
  Globe,
  DollarSign,
} from 'lucide-react'
import type { Listing } from '../CategoryListings/CategoryListings'
import './PaymentConfirmation.css'

type PaymentOption = 'full' | 'split'

export function PaymentConfirmation({
  listing,
  stayDates,
  stayNights,
  paymentOption,
  onPaymentOptionChange,
  onBack,
  onHome,
  onPaid,
}: {
  listing: Listing
  stayDates: { start: Date | null; end: Date | null }
  stayNights: number
  paymentOption: PaymentOption
  onPaymentOptionChange: (option: PaymentOption) => void
  onBack: () => void
  onHome: () => void
  onPaid: () => void
}) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const totalPrice = listing.price * stayNights + 20
  const firstInstallment = Math.round(totalPrice * 50) / 100
  const secondInstallment = totalPrice - firstInstallment
  const formatMoney = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const dateRangeText = stayDates.start
    ? `${new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(stayDates.start)}${stayDates.end ? ` — ${new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(stayDates.end)}` : ''}`
    : 'Дати не обрано'

  function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cardDigits = cardNumber.replace(/\D/g, '')
    if (cardDigits.length < 13 || cardDigits.length > 19) {
      window.alert('Номер картки має містити від 13 до 19 цифр.')
      return
    }

    const [month, year] = expiry.split('/').map((part) => Number(part.trim()))
    const expirationDate = new Date(2000 + year, month)
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    if (expirationDate <= currentMonth) {
      window.alert('Термін дії картки завершився. Перевірте введені дані.')
      return
    }

    window.alert('Оплату успішно підтверджено!')
    onPaid()
  }

  return (
    <div className="payment">
      <button type="button" className="payment__back" onClick={onBack} aria-label="Назад">
        <ChevronLeft size={18} aria-hidden />
      </button>

      <header className="payment__header">
        <span className="payment__logo">HomeFU</span>
        <a className="payment__home-link" href="/" onClick={(event) => { event.preventDefault(); onHome() }}>Запропонувати помешкання на HomeFU</a>
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

          <section className="payment__section">
            <h2 className="payment__section-title">Ваша подорож</h2>

            <div className="payment__trip-row">
              <div>
                <h3>Дати</h3>
                <p>{dateRangeText}</p>
              </div>
              <a href="#edit-dates">Редагувати</a>
            </div>

            <div className="payment__divider" />

            <div className="payment__trip-row">
              <div>
                <h3>Гості</h3>
                <p>До {listing.maxGuests} гостей</p>
              </div>
              <a href="#edit-guests">Редагувати</a>
            </div>
          </section>

          <div className="payment__divider" />

          <section className="payment__section">
            <h2 className="payment__section-title">Виберіть варіант оплати</h2>

            <div className="payment__payment-options">
              <label
                className={`payment__payment-option${paymentOption === 'full' ? ' payment__payment-option--active' : ''}`}
              >
                <div>
                  <h3>Оплатити в повному обсязі</h3>
                  <p>Сплатіть усю суму (${formatMoney(totalPrice)}) одразу.</p>
                </div>
                <span className={`payment__radio${paymentOption === 'full' ? ' payment__radio--active' : ''}`} aria-hidden="true">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentOption === 'full'}
                    onChange={() => onPaymentOptionChange('full')}
                    aria-label="Оплатити в повному обсязі"
                  />
                </span>
              </label>

              <label
                className={`payment__payment-option${paymentOption === 'split' ? ' payment__payment-option--active' : ''}`}
              >
                <div>
                  <h3>Оплата двома частинами</h3>
                  <p>
                    ${formatMoney(firstInstallment)} потрібно сплатити сьогодні, ${formatMoney(secondInstallment)} — перед поїздкою.
                    <br />
                    Жодних додаткових зборів. <a href="#more">Докладніше</a>
                  </p>
                </div>
                <span className={`payment__radio${paymentOption === 'split' ? ' payment__radio--active' : ''}`} aria-hidden="true">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentOption === 'split'}
                    onChange={() => onPaymentOptionChange('split')}
                    aria-label="Оплата двома частинами"
                  />
                </span>
              </label>
            </div>
          </section>

          <section className="payment__section">
            <h2 className="payment__section-title">Оплатити за допомогою</h2>

            <div className="payment__method-picker">
              <CreditCard size={18} aria-hidden />
              <span>Кредитна або дебетова картка</span>
            </div>

            <form id="payment-form" onSubmit={handlePaymentSubmit}>
              <div className="payment__fieldset">
              <div className="payment__field">
                <span className="payment__field-label">Номер картки</span>
                <input
                  className="payment__field-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  required
                  pattern="[0-9 ]{13,23}"
                  title="Введіть номер картки, що містить від 13 до 19 цифр"
                />
              </div>

              <div className="payment__field payment__field--split">
                <div className="payment__field-half">
                  <span className="payment__field-label">Термін дії</span>
                  <input
                    className="payment__field-input"
                    type="text"
                    placeholder="ММ / РР"
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value)}
                    required
                    pattern="(0[1-9]|1[0-2]) */ *[0-9]{2}"
                    title="Введіть дату у форматі ММ / РР"
                  />
                </div>
                <div className="payment__field-divider" />
                <div className="payment__field-half">
                  <span className="payment__field-label">CVV</span>
                  <input
                    className="payment__field-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="000"
                    value={cvv}
                    onChange={(event) => setCvv(event.target.value)}
                    required
                    pattern="[0-9]{3,4}"
                    maxLength={4}
                    title="CVV має містити 3 або 4 цифри"
                  />
                </div>
              </div>

              <div className="payment__field">
                <span className="payment__field-label">Індекс</span>
                <input
                  className="payment__field-input"
                  type="text"
                  placeholder="65000"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  required
                  pattern="[0-9]{5}"
                  maxLength={5}
                  title="Введіть поштовий індекс із 5 цифр"
                />
              </div>
              </div>
            </form>
          </section>

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

          <button type="submit" form="payment-form" className="payment__submit">
            Підтвердити й оплатити
          </button>
        </main>

        <aside className="payment__summary">
          <div className="payment__summary-card">
            <img
              className="payment__summary-image"
              src={listing.image}
              alt="Помешкання"
            />
            <div className="payment__summary-body">
              <p className="payment__summary-desc">
                {listing.location}
                <br />
                {listing.title}
              </p>
              {listing.rating !== null && <p className="payment__summary-rating">
                <Star size={12} fill="currentColor" aria-hidden /> {listing.rating.toFixed(2)} ·{' '}
                <a href="#reviews">{listing.reviewCount} відгуків</a>
              </p>}
            </div>
          </div>

          <div className="payment__divider" />

          <h2 className="payment__summary-title">Детальніше про ціну</h2>

          <div className="payment__price-row">
            <span>${formatMoney(listing.price)} х {stayNights} ночей</span>
            <span>${formatMoney(listing.price * stayNights)}</span>
          </div>
          <div className="payment__price-row">
            <a href="#cleaning-fee">Плата за прибирання</a>
            <span>$20,00</span>
          </div>

          <div className="payment__divider" />

          <div className="payment__price-row payment__price-row--total">
            <span>Усього <a href="#usd">(USD)</a></span>
            <span>${formatMoney(totalPrice)}</span>
          </div>
        </aside>
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
