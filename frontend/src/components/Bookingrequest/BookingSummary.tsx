import { Star } from 'lucide-react'
import type { Listing } from '../../types/listing'

type BookingSummaryProps = {
  listing: Listing
  stayNights: number
  totalPrice: number
  formatMoney: (amount: number) => string
}

export function BookingSummary({ listing, stayNights, totalPrice, formatMoney }: BookingSummaryProps) {
  return (
    // Отображение сводки по готовым props без собственного расчёта состояния.
    <aside className="booking__summary">
      <div className="booking__summary-card">
        <img className="booking__summary-image" src={listing.image} alt="Помешкання" />
        <div className="booking__summary-body">
          <p className="booking__summary-desc">
            {listing.location}
            <br />
            {listing.title}
          </p>
          {listing.rating !== null && <p className="booking__summary-rating">
            <Star size={12} fill="currentColor" aria-hidden /> {listing.rating.toFixed(2)} ·{' '}
            <a href="#reviews">{listing.reviewCount} відгуків</a>
          </p>}
        </div>
      </div>

      <div className="booking__divider" />
      <h2 className="booking__summary-title">Детальніше про ціну</h2>

      <div className="booking__price-row">
        <span>${formatMoney(listing.price)} х {stayNights} ночей</span>
        <span>${formatMoney(listing.price * stayNights)}</span>
      </div>
      <div className="booking__price-row">
        <a href="#cleaning-fee">Плата за прибирання</a>
        <span>$20,00</span>
      </div>

      <div className="booking__divider" />

      <div className="booking__price-row booking__price-row--total">
        <span>Усього <a href="#usd">(USD)</a></span>
        <span>${formatMoney(totalPrice)}</span>
      </div>
    </aside>
  )
}
