import { useState } from 'react'
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
  onBack,
}: {
  listing: Listing
  onBack: () => void
}) {
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [postalCode, setPostalCode] = useState('')

  return (
    <div className="payment">
      <button type="button" className="payment__back" onClick={onBack} aria-label="Назад">
        <ChevronLeft size={18} aria-hidden />
      </button>

      <header className="payment__header">
        <span className="payment__logo">HomeFU</span>
      </header>

      <div className="payment__layout">
        <main className="payment__main">
          <h1 className="payment__title">Підтвердження й оплата</h1>

          <div className="payment__notice">
            <Info size={22} aria-hidden className="payment__notice-icon" />
            <div className="payment__notice-text">
              <h2>Це рідкісна знахідка</h2>
              <p>Помешкання господаря Марія зазвичай заброньоване.</p>
            </div>
          </div>

          <section className="payment__section">
            <h2 className="payment__section-title">Ваша подорож</h2>

            <div className="payment__trip-row">
              <div>
                <h3>Дати</h3>
                <p>4-9 січ.2024</p>
              </div>
              <a href="#edit-dates">Редагувати</a>
            </div>

            <div className="payment__divider" />

            <div className="payment__trip-row">
              <div>
                <h3>Гості</h3>
                <p>1 гість</p>
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
                  <p>Сплатіть усю суму ($335,00) одразу.</p>
                </div>
                <span className={`payment__radio${paymentOption === 'full' ? ' payment__radio--active' : ''}`} aria-hidden="true">
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
                className={`payment__payment-option${paymentOption === 'split' ? ' payment__payment-option--active' : ''}`}
              >
                <div>
                  <h3>Оплата двома частинами</h3>
                  <p>
                    $65,60 потрібно оплатити сьогодні, $262,40 - 22груд.2023р…
                    <br />
                    Жодних додаткових зборів. <a href="#more">Докладніше</a>
                  </p>
                </div>
                <span className={`payment__radio${paymentOption === 'split' ? ' payment__radio--active' : ''}`} aria-hidden="true">
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

          <section className="payment__section">
            <h2 className="payment__section-title">Оплатити за допомогою</h2>

            <div className="payment__method-picker">
              <CreditCard size={18} aria-hidden />
              <span>Кредитна або дебетова картка</span>
            </div>

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
                />
              </div>
            </div>
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

          <button type="button" className="payment__submit">
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
                {listing.category}
                <br />
                {listing.dates}
              </p>
              <p className="payment__summary-rating">
                <Star size={12} fill="currentColor" aria-hidden /> {listing.rating.toFixed(2)} ·{' '}
                <a href="#reviews">35 відгуків</a>
              </p>
            </div>
          </div>

          <div className="payment__divider" />

          <h2 className="payment__summary-title">Детальніше про ціну</h2>

          <div className="payment__price-row">
            <span>${listing.price},00 х 5 ночей</span>
            <span>${listing.price * 5},00</span>
          </div>
          <div className="payment__price-row">
            <a href="#cleaning-fee">Плата за прибирання</a>
            <span>$20,00</span>
          </div>

          <div className="payment__divider" />

          <div className="payment__price-row payment__price-row--total">
            <span>Усього <a href="#usd">(USD)</a></span>
            <span>${listing.price * 5 + 20},00</span>
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
