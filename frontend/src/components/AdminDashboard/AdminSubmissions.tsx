import { useCallback, useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import {
  STATUS_LABELS,
  approveSubmission,
  getSubmissions,
  rejectSubmission,
  type ListingSubmission,
  type SubmissionStatus,
} from '../../api/hostListings'
import './AdminSubmissions.css'

interface AdminSubmissionsProps {
  accessToken: string
  onChanged: () => void
}

const FILTERS: SubmissionStatus[] = ['Pending', 'Approved', 'Rejected']

export function AdminSubmissions({ accessToken, onChanged }: AdminSubmissionsProps) {
  const [filter, setFilter] = useState<SubmissionStatus>('Pending')
  const [items, setItems] = useState<ListingSubmission[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      setItems(await getSubmissions(accessToken, filter))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не вдалося завантажити заявки')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, filter])

  useEffect(() => {
    void load()
  }, [load])

  const selected = items.find((item) => item.id === selectedId) ?? null

  async function review(action: () => Promise<void>, doneMessage: string) {
    setIsBusy(true)
    setError('')
    setNotice('')
    try {
      await action()
      setNotice(doneMessage)
      setSelectedId(null)
      setReason('')
      await load()
      onChanged()
    } catch (reasonError) {
      setError(reasonError instanceof Error ? reasonError.message : 'Не вдалося виконати дію')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <>
      {(error || notice) && (
        <p className={`admin-message${error ? ' admin-message--error' : ''}`} role={error ? 'alert' : 'status'}>
          {error || notice}
        </p>
      )}
      <div className="admin-layout">
        <section className="admin-list-panel" aria-label="Заявки на помешкання">
          <div className="admin-panel-heading">
            <h2>Заявки</h2>
            <span>{items.length}</span>
          </div>
          <div className="admin-filters">
            {FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                className={`admin-filter${filter === status ? ' admin-filter--active' : ''}`}
                onClick={() => { setFilter(status); setSelectedId(null) }}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
          {isLoading ? <p className="admin-empty">Завантаження…</p> : items.length === 0 ? <p className="admin-empty">Заявок немає.</p> : (
            <ul className="admin-list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`admin-list-item${selectedId === item.id ? ' admin-list-item--active' : ''}`}
                    onClick={() => { setSelectedId(item.id); setReason('') }}
                  >
                    <span className="admin-list-item__image">
                      {item.images[0] && <img src={item.images[0].imageUrl} alt="" />}
                    </span>
                    <span className="admin-list-item__copy">
                      <strong>{item.title}</strong>
                      <span>{item.hostEmail}</span>
                      <span className="admin-status">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('uk-UA') : ''} · ${item.pricePerNight}/ніч
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-form-panel" aria-label="Деталі заявки">
          {!selected ? (
            <p className="admin-empty">Оберіть заявку зі списку, щоб переглянути деталі.</p>
          ) : (
            <>
              <div className="admin-panel-heading">
                <h2>{selected.title}</h2>
                <span className="admin-submission-status">{STATUS_LABELS[selected.status]}</span>
              </div>
              <div className="admin-submission">
                <dl>
                  <dt>Господар</dt>
                  <dd>{selected.hostName ? `${selected.hostName} · ` : ''}{selected.hostEmail}</dd>
                  <dt>Адреса</dt>
                  <dd>{selected.location}{selected.region ? `, ${selected.region}` : ''}</dd>
                  <dt>Категорія</dt>
                  <dd>{selected.category}</dd>
                  <dt>Ціна / гостей</dt>
                  <dd>${selected.pricePerNight} за ніч · до {selected.maxGuests} гостей</dd>
                  <dt>Координати</dt>
                  <dd>{selected.latitude}, {selected.longtitude}</dd>
                  <dt>Зручності</dt>
                  <dd>{selected.amenities.length ? selected.amenities.map((a) => a.name).join(', ') : '—'}</dd>
                  <dt>Опис</dt>
                  <dd className="admin-submission__description">{selected.description || '—'}</dd>
                </dl>
                <div className="admin-image-list">
                  {selected.images.map((image) => (
                    <div key={image.id} className="admin-image-item">
                      <img src={image.imageUrl} alt="Фото помешкання" />
                      {image.isCover && <span>Обкладинка</span>}
                    </div>
                  ))}
                </div>

                {selected.status === 'Pending' ? (
                  <div className="admin-submission__review">
                    <label className="admin-field">
                      <span>Причина відхилення (обов'язково для відхилення)</span>
                      <textarea rows={3} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} />
                    </label>
                    <div className="admin-form-actions">
                      <button
                        type="button"
                        className="admin-primary-button"
                        disabled={isBusy}
                        onClick={() => void review(() => approveSubmission(accessToken, selected.id), 'Заявку схвалено, помешкання опубліковано.')}
                      >
                        <Check size={16} aria-hidden /> Схвалити та опублікувати
                      </button>
                      <button
                        type="button"
                        className="admin-primary-button admin-danger-button"
                        disabled={isBusy || reason.trim() === ''}
                        onClick={() => void review(() => rejectSubmission(accessToken, selected.id, reason.trim()), 'Заявку відхилено.')}
                      >
                        <X size={16} aria-hidden /> Відхилити
                      </button>
                    </div>
                  </div>
                ) : selected.rejectionReason && (
                  <p className="admin-message admin-message--error">Причина відхилення: {selected.rejectionReason}</p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  )
}
