type PaymentOption = 'full' | 'split'

type BookingPaymentOptionsProps = {
  paymentOption: PaymentOption
  totalPrice: number
  formatMoney: (amount: number) => string
  onPaymentOptionChange: (option: PaymentOption) => void
}

export function BookingPaymentOptions({ paymentOption, totalPrice, formatMoney, onPaymentOptionChange }: BookingPaymentOptionsProps) {
  // Расчёт двух частей с учётом округления первой суммы.
  const firstInstallment = Math.round(totalPrice * 50) / 100
  const secondInstallment = totalPrice - firstInstallment

  return (
    <section className="booking__section">
      <h2 className="booking__section-title">Виберіть варіант оплати</h2>

      <div className="booking__payment-options">
        <label className={`booking__payment-option${paymentOption === 'full' ? ' booking__payment-option--active' : ''}`}>
          <div>
            <h3>Оплатити в повному обсязі</h3>
            <p>Сплатіть усю суму (${formatMoney(totalPrice)}) одразу.</p>
          </div>
          <span className="booking__radio" aria-hidden="true">
            <input
              type="radio"
              name="payment"
              checked={paymentOption === 'full'}
              onChange={() => onPaymentOptionChange('full')}
              aria-label="Оплатити в повному обсязі"
            />
          </span>
        </label>

        <label className={`booking__payment-option${paymentOption === 'split' ? ' booking__payment-option--active' : ''}`}>
          <div>
            <h3>Оплата двома частинами</h3>
            <p>
              ${formatMoney(firstInstallment)} потрібно сплатити сьогодні, ${formatMoney(secondInstallment)} — перед поїздкою.
              <br />
              Жодних додаткових зборів. <a href="#more">Докладніше</a>
            </p>
          </div>
          <span className="booking__radio" aria-hidden="true">
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
  )
}
