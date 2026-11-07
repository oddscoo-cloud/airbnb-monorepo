export type PaymentOption = 'full' | 'split'
import { useLanguage } from '../../i18n'

type PaymentOptionSelectorProps = {
  totalPrice: number
  paymentOption: PaymentOption
  onPaymentOptionChange: (option: PaymentOption) => void
  formatMoney: (amount: number) => string
}

export function PaymentOptionSelector({
  totalPrice,
  paymentOption,
  onPaymentOptionChange,
  formatMoney,
}: PaymentOptionSelectorProps) {
  const { t } = useLanguage()
  // Расчёт второй части как остатка для точного совпадения с totalPrice.
  const firstInstallment = Math.round(totalPrice * 50) / 100
  const secondInstallment = totalPrice - firstInstallment

  return (
    <section className="payment__section">
      <h2 className="payment__section-title">{t('Виберіть варіант оплати')}</h2>

      <div className="payment__payment-options">
        <label
          className={`payment__payment-option${paymentOption === 'full' ? ' payment__payment-option--active' : ''}`}
        >
          <div>
            <h3>{t('Оплатити в повному обсязі')}</h3>
            <p>{t('Сплатіть усю суму (')}${formatMoney(totalPrice)}{t(') одразу.')}</p>
          </div>
          <span className={`payment__radio${paymentOption === 'full' ? ' payment__radio--active' : ''}`} aria-hidden="true">
            <input
              type="radio"
              name="payment"
              checked={paymentOption === 'full'}
              onChange={() => onPaymentOptionChange('full')}
              aria-label={t('Оплатити в повному обсязі')}
            />
          </span>
        </label>

        <label
          className={`payment__payment-option${paymentOption === 'split' ? ' payment__payment-option--active' : ''}`}
        >
          <div>
            <h3>{t('Оплата двома частинами')}</h3>
            <p>
              ${formatMoney(firstInstallment)}{t(' потрібно сплатити сьогодні, ')}${formatMoney(secondInstallment)}{t(' — перед поїздкою.')}
              <br />
              {t('Жодних додаткових зборів.')} <a href="#more">{t('Докладніше')}</a>
            </p>
          </div>
          <span className={`payment__radio${paymentOption === 'split' ? ' payment__radio--active' : ''}`} aria-hidden="true">
            <input
              type="radio"
              name="payment"
              checked={paymentOption === 'split'}
              onChange={() => onPaymentOptionChange('split')}
              aria-label={t('Оплата двома частинами')}
            />
          </span>
        </label>
      </div>
    </section>
  )
}
