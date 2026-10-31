import type { Listing } from '../../types/listing'

type PaymentTripSectionProps = {
  listing: Listing
  stayDates: { start: Date | null; end: Date | null }
}

export function PaymentTripSection({ listing, stayDates }: PaymentTripSectionProps) {
  // Форматирование дат; ссылки редактирования пока без обработчиков.
  const dateRangeText = stayDates.start
    ? `${new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(stayDates.start)}${stayDates.end ? ` — ${new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(stayDates.end)}` : ''}`
    : 'Дати не обрано'

  return (
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
  )
}
