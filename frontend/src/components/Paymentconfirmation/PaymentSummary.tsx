import { Star } from 'lucide-react'
import type { Listing } from '../../types/listing'

type PaymentSummaryProps = {
  listing: Listing
  stayNights: number
  totalPrice: number
  formatMoney: (amount: number) => string
}

export function PaymentSummary({ listing, stayNights, totalPrice, formatMoney }: PaymentSummaryProps) {
  return (
    // Итоговая сводка по готовым данным без изменения состояния оплаты.
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
  )
}
