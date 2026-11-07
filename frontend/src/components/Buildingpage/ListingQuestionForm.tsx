import { useState, type FormEvent } from 'react'
import { createListingQuestion } from '../../api/listingQuestions'
import { useLanguage } from '../../i18n'

export function ListingQuestionForm({ listingId }: { listingId: string }) {
  const { t } = useLanguage()
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setIsSent(false)
    try {
      await createListingQuestion(listingId, { senderName, senderEmail, message })
      setIsSent(true)
      setSenderName('')
      setSenderEmail('')
      setMessage('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('Не вдалося надіслати запитання'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="property__section property__question-section" aria-labelledby="listing-question-title">
      <h2 id="listing-question-title" className="property__section-title">{t('Є питання про помешкання?')}</h2>
      <p className="property__question-note">
        {t('Напишіть власнику оголошення. Відповідь може надійти на вказану вами пошту не відразу.')}
      </p>
      <form className="property__question-form" onSubmit={handleSubmit}>
        <label>
          <span>{t('Ваше ім’я')}</span>
          <input
            required
            maxLength={120}
            autoComplete="name"
            value={senderName}
            onChange={(event) => setSenderName(event.target.value)}
          />
        </label>
        <label>
          <span>{t('Електронна пошта для відповіді')}</span>
          <input
            required
            type="email"
            maxLength={254}
            autoComplete="email"
            value={senderEmail}
            onChange={(event) => setSenderEmail(event.target.value)}
          />
        </label>
        <label>
          <span>{t('Ваше запитання')}</span>
          <textarea
            required
            maxLength={2000}
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
        {isSent && (
          <p className="property__question-result" role="status">
            {t('Лист надіслано власнику. Він зможе відповісти вам на вказану пошту.')}
          </p>
        )}
        {error && <p className="property__question-error" role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('Надсилання…') : t('Надіслати запитання')}
        </button>
      </form>
    </section>
  )
}
