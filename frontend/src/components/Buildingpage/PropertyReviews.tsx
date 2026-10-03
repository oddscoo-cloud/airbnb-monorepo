import { useState, type FormEvent } from 'react'
import { Star } from 'lucide-react'
import type { Listing } from '../../types/listing'
import type { ListingReview } from '../../types/listing'
import { apiRequest } from '../../api/http'

type Review = Listing['reviews'][number]

type PropertyReviewsProps = {
  listingId: string
  initialReviews: Review[]
  onReviewAdded: () => void
}

export function PropertyReviews({ listingId, initialReviews, onReviewAdded }: PropertyReviewsProps) {
  // Локальные отзывы и поля формы; начальные данные приходят с объявлением.
  const [reviews, setReviews] = useState(initialReviews)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    // Отмена стандартной отправки формы и включение состояния загрузки.
    event.preventDefault()
    setReviewError('')
    setIsReviewSubmitting(true)

    try {
      // Access token текущей вкладки для авторизованной отправки отзыва.
      const accessToken = sessionStorage.getItem('access_token')
      const result = await apiRequest<ListingReview>(`/api/listings/${listingId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
        accessToken: accessToken ?? undefined,
        fallbackError: () => 'Не вдалося додати відгук.',
      })

      // Обновление списка отзывов, сброс формы и запрос обновления объявления в App.
      setReviews((current) => [result, ...current])
      setReviewComment('')
      setReviewRating(5)
      onReviewAdded()
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Не вдалося додати відгук.')
    } finally {
      setIsReviewSubmitting(false)
    }
  }

  return (
    <section id="reviews" className="property__section">
      <h2 className="property__section-title">
        {reviews.length > 0
          ? `${(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(2)} · ${reviews.length} відгуків`
          : 'Відгуків ще немає'}
      </h2>
      {reviews.length > 0 && <div className="property__reviews">
        {reviews.map((review) => {
          const authorName = review.authorName || 'Анонімний користувач'
          // Допустимые адреса аватара: локальный путь или HTTP(S) URL.
          const avatarUrl = review.avatarUrl && (review.avatarUrl.startsWith('/') || /^https?:\/\//i.test(review.avatarUrl))
            ? review.avatarUrl
            : null

          return (
            <article key={review.id} className="property__review">
              <div className="property__review-avatar">
                {avatarUrl ? <img src={avatarUrl} alt="" /> : authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3>{authorName}</h3>
                <span className="property__review-rating"><Star size={14} fill="currentColor" aria-hidden /> {review.rating.toFixed(1)}</span>
                <p>{review.comment}</p>
              </div>
            </article>
          )
        })}
      </div>}

      <form className="property__review-form" onSubmit={handleReviewSubmit}>
        <h3>Залишити відгук</h3>
        <label>
          <span>Оцінка</span>
          <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} з 5</option>)}
          </select>
        </label>
        <label>
          <span>Коментар</span>
          <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} maxLength={2000} required />
        </label>
        {reviewError && <p className="property__review-error" role="alert">{reviewError}</p>}
        <button type="submit" disabled={isReviewSubmitting}>{isReviewSubmitting ? 'Надсилання…' : 'Додати відгук'}</button>
      </form>
    </section>
  )
}
