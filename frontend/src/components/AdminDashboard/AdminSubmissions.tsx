import { useCallback, useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import {
  STATUS_LABELS,
  approveSubmission,
  createHostAmenity,
  getHostAmenities,
  getSubmissions,
  rejectSubmission,
  updateSubmission,
  type HostAmenity,
  type ListingSubmission,
  type SubmissionEdit,
  type SubmissionStatus,
} from '../../api/hostListings'
import { getAllRegions, type Region } from '../../api/regions'
import { AmenityIcon } from '../AmenityIcon/AmenityIcon'
import { AmenityCreate } from '../AmenityIcon/AmenityCreate'
import { formatPrice } from '../../utils/formatPrice'
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
  const [edit, setEdit] = useState<(Omit<SubmissionEdit, 'pricePerNight' | 'maxGuests' | 'latitude' | 'longtitude'> & {
    pricePerNight: string
    maxGuests: string
    latitude: string
    longtitude: string
  }) | null>(null)
  const [amenities, setAmenities] = useState<HostAmenity[]>([])
  const [regions, setRegions] = useState<Region[]>([])

  useEffect(() => {
    void Promise.all([getHostAmenities(accessToken), getAllRegions(accessToken)])
      .then(([a, r]) => { setAmenities(a); setRegions(r) })
      .catch(() => undefined)
  }, [accessToken])

  function startEdit(item: ListingSubmission) {
    setEdit({
      title: item.title,
      location: item.location ?? '',
      regionName: item.region ?? '',
      category: item.category ?? '',
      description: item.description ?? '',
      pricePerNight: String(item.pricePerNight),
      maxGuests: String(item.maxGuests),
      latitude: String(item.latitude),
      longtitude: String(item.longtitude),
      amenityIds: item.amenities.map((a) => a.id),
    })
  }

  function setField(key: string, value: string) {
    setEdit((current) => (current ? { ...current, [key]: value } : current))
  }

  async function saveEdit() {
    if (!selected || !edit) return
    setIsBusy(true)
    setError('')
    setNotice('')
    try {
      await updateSubmission(accessToken, selected.id, {
        ...edit,
        title: edit.title.trim(),
        regionName: edit.regionName.trim(),
        pricePerNight: Number(edit.pricePerNight),
        maxGuests: Number(edit.maxGuests),
        latitude: Number(edit.latitude),
        longtitude: Number(edit.longtitude),
      })
      setNotice('Зміни збережено.')
      setEdit(null)
      await load()
      getAllRegions(accessToken).then(setRegions).catch(() => undefined)
    } catch (reasonError) {
      setError(reasonError instanceof Error ? reasonError.message : 'Не вдалося зберегти зміни')
    } finally {
      setIsBusy(false)
    }
  }

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
                    onClick={() => { setSelectedId(item.id); setReason(''); setEdit(null) }}
                  >
                    <span className="admin-list-item__image">
                      {item.images[0] && <img src={item.images[0].imageUrl} alt="" />}
                    </span>
                    <span className="admin-list-item__copy">
                      <strong>{item.title}</strong>
                      <span>{item.hostEmail}</span>
                      <span className="admin-status">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('uk-UA') : ''} · ${formatPrice(item.pricePerNight)}/ніч
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
                {edit && selected.status === 'Pending' ? (
                  <form className="admin-submission__edit" onSubmit={(e) => { e.preventDefault(); void saveEdit() }}>
                    <label className="admin-field"><span>Назва</span>
                      <input required maxLength={200} value={edit.title} onChange={(e) => setField('title', e.target.value)} />
                    </label>
                    <label className="admin-field"><span>Адреса</span>
                      <input maxLength={200} value={edit.location} onChange={(e) => setField('location', e.target.value)} />
                    </label>
                    <label className="admin-field"><span>Регіон (оберіть або впишіть новий)</span>
                      <input list="submission-regions" maxLength={100} value={edit.regionName} onChange={(e) => setField('regionName', e.target.value)} />
                      <datalist id="submission-regions">
                        {regions.map((r) => <option key={r.id} value={r.name} />)}
                      </datalist>
                    </label>
                    <label className="admin-field"><span>Категорія</span>
                      <input maxLength={100} value={edit.category} onChange={(e) => setField('category', e.target.value)} />
                    </label>
                    <label className="admin-field"><span>Ціна за ніч</span>
                      <input type="number" min="0" step="any" required value={edit.pricePerNight} onChange={(e) => setField('pricePerNight', e.target.value)} />
                    </label>
                    <label className="admin-field"><span>Гостей</span>
                      <input type="number" min="1" required value={edit.maxGuests} onChange={(e) => setField('maxGuests', e.target.value)} />
                    </label>
                    <label className="admin-field"><span>Широта</span>
                      <input type="number" step="any" value={edit.latitude} onChange={(e) => setField('latitude', e.target.value)} />
                    </label>
                    <label className="admin-field"><span>Довгота</span>
                      <input type="number" step="any" value={edit.longtitude} onChange={(e) => setField('longtitude', e.target.value)} />
                    </label>
                    <label className="admin-field"><span>Опис</span>
                      <textarea rows={5} value={edit.description} onChange={(e) => setField('description', e.target.value)} />
                    </label>
                    <fieldset className="admin-field">
                      <legend>Зручності</legend>
                      <div className="admin-checkboxes">
                      {amenities.map((a) => (
                        <label key={a.id} style={{ display: 'inline-flex', gap: 4, marginRight: 12 }}>
                          <input
                            type="checkbox"
                            checked={edit.amenityIds.includes(a.id)}
                            onChange={(e) => setEdit({
                              ...edit,
                              amenityIds: e.target.checked ? [...edit.amenityIds, a.id] : edit.amenityIds.filter((id) => id !== a.id),
                            })}
                          />
                          <AmenityIcon icon={a.icon} size={16} />
                          {a.name}
                        </label>
                      ))}
                      </div>
                      <AmenityCreate
                        onCreate={async (name, icon) => {
                          const created = await createHostAmenity(accessToken, name, icon)
                          setAmenities((prev) => prev.some((x) => x.id === created.id) ? prev : [...prev, created])
                          setEdit((prev) => prev && !prev.amenityIds.includes(created.id)
                            ? { ...prev, amenityIds: [...prev.amenityIds, created.id] }
                            : prev)
                        }}
                      />
                    </fieldset>
                    <div className="admin-form-actions">
                      <button type="submit" className="admin-primary-button" disabled={isBusy}>Зберегти</button>
                      <button type="button" className="admin-primary-button admin-danger-button" disabled={isBusy} onClick={() => setEdit(null)}>Скасувати</button>
                    </div>
                  </form>
                ) : (
                <>
                {selected.status === 'Pending' && (
                  <button type="button" className="admin-primary-button" onClick={() => startEdit(selected)}>Редагувати заявку</button>
                )}
                <dl>
                  <dt>Господар</dt>
                  <dd>{selected.hostName ? `${selected.hostName} · ` : ''}{selected.hostEmail}</dd>
                  <dt>Адреса</dt>
                  <dd>{selected.location}{selected.region ? `, ${selected.region}` : ''}</dd>
                  <dt>Категорія</dt>
                  <dd>{selected.category}</dd>
                  <dt>Ціна / гостей</dt>
                  <dd>${formatPrice(selected.pricePerNight)} за ніч · до {selected.maxGuests} гостей</dd>
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
                </>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  )
}
