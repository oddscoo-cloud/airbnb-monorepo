import type { Listing } from '../../types/listing'
import { useLanguage } from '../../i18n'

type PaymentTripSectionProps = {
  listing: Listing
  stayDates: { start: Date | null; end: Date | null }
}

export function PaymentTripSection({ listing, stayDates }: PaymentTripSectionProps) {
  const { language, t } = useLanguage()
  // Форматирование дат; ссылки редактирования пока без обработчиков.
  const dateRangeText = stayDates.start
    ? `${new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(stayDates.start)}${stayDates.end ? ` — ${new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(stayDates.end)}` : ''}`
    : t('Дати не обрано')

  return (
    <section className="payment__section">
      <h2 className="payment__section-title">{t('Ваша подорож')}</h2>

      <div className="payment__trip-row">
        <div>
          <h3>{t('Дати')}</h3>
          <p>{dateRangeText}</p>
        </div>
        <a href="#edit-dates">{t('Редагувати')}</a>
      </div>

      <div className="payment__divider" />

      <div className="payment__trip-row">
        <div>
          <h3>{t('Гості')}</h3>
          <p>{t('До гостей')} {listing.maxGuests}</p>
        </div>
        <a href="#edit-guests">{t('Редагувати')}</a>
      </div>
    </section>
  )
}
