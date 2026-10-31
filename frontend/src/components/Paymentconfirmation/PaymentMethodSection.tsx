import { useState, type FormEvent } from 'react'
import { CreditCard } from 'lucide-react'

type PaymentMethodSectionProps = {
  onPaid: () => void
}

export function PaymentMethodSection({ onPaid }: PaymentMethodSectionProps) {
  // Локальное состояние полей без передачи реквизитов на сервер.
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [postalCode, setPostalCode] = useState('')

  function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Очистка номера карты от нецифровых символов перед проверкой длины.
    const cardDigits = cardNumber.replace(/\D/g, '')
    if (cardDigits.length < 13 || cardDigits.length > 19) {
      window.alert('Номер картки має містити від 13 до 19 цифр.')
      return
    }

    // Сравнение срока MM / YY с началом текущего месяца.
    const [month, year] = expiry.split('/').map((part) => Number(part.trim()))
    const expirationDate = new Date(2000 + year, month)
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    if (expirationDate <= currentMonth) {
      window.alert('Термін дії картки завершився. Перевірте введені дані.')
      return
    }

    // Демонстрационное подтверждение без авторизации и списания средств.
    window.alert('Оплату успішно підтверджено!')
    onPaid()
  }

  return (
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
  )
}
