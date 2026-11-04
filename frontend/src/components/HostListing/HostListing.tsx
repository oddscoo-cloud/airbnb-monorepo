import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowLeft, ImagePlus, X } from 'lucide-react'
import { getCurrentUser, type UserResponse } from '../../api/users'
import { getAllRegions, type Region } from '../../api/regions'
import {
  LISTING_CATEGORIES,
  STATUS_LABELS,
  getHostAmenities,
  getMySubmissions,
  submitListing,
  type HostAmenity,
  type ListingSubmission,
} from '../../api/hostListings'
import { UserMenu, type UserMenuProps } from '../UserMenu/UserMenu'
import './HostListing.css'

interface HostListingProps {
  accessToken: string
  menu: UserMenuProps
  onHome?: () => void
  onVerify?: () => void
}

type Step = 1 | 2 | 3

interface FormState {
  title: string
  category: string
  regionName: string
  location: string
  latitude: string
  longtitude: string
  pricePerNight: string
  maxGuests: string
  description: string
  amenityIds: number[]
}

const EMPTY_FORM: FormState = {
  title: '',
  category: '',
  regionName: '',
  location: '',
  latitude: '50.4501',
  longtitude: '30.5234',
  pricePerNight: '',
  maxGuests: '2',
  description: '',
  amenityIds: [],
}

const MAX_PHOTOS = 15
const MAX_PHOTO_BYTES = 12 * 1024 * 1024

function PhotoTile({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  return (
    <div className="host__photo">
      <img src={url} alt={file.name} />
      <button type="button" onClick={onRemove} aria-label="Прибрати фото">
        <X size={14} aria-hidden />
      </button>
    </div>
  )
}

export function HostListing({ accessToken, menu, onHome, onVerify }: HostListingProps) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [amenities, setAmenities] = useState<HostAmenity[]>([])
  const [submissions, setSubmissions] = useState<ListingSubmission[]>([])
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [photos, setPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void (async () => {
      try {
        const current = await getCurrentUser(accessToken, controller.signal)
        setUser(current)
        if (!current.isVerified) return
        const [regionData, amenityData, mine] = await Promise.all([
          getAllRegions(accessToken, controller.signal),
          getHostAmenities(accessToken, controller.signal),
          getMySubmissions(accessToken, controller.signal),
        ])
        setRegions(regionData)
        setAmenities(amenityData)
        setSubmissions(mine)
      } catch (reason) {
        if (!controller.signal.aborted) {
          setLoadError(reason instanceof Error ? reason.message : 'Не вдалося завантажити дані')
        }
      }
    })()
    return () => controller.abort()
  }, [accessToken])

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handlePhotos(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? [])
    event.target.value = ''
    const valid = picked.filter((file) => file.size <= MAX_PHOTO_BYTES)
    setError(valid.length < picked.length ? 'Деякі фото перевищують 12 МБ і були пропущені.' : null)
    setPhotos((current) => [...current, ...valid].slice(0, MAX_PHOTOS))
  }

  const step1Valid = form.title.trim() !== '' && form.category !== '' && form.location.trim() !== ''
  const step2Valid = Number(form.pricePerNight) >= 1 && Number(form.maxGuests) >= 1

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (photos.length === 0) return
    setIsSubmitting(true)
    setError(null)
    try {
      await submitListing(accessToken, {
        title: form.title.trim(),
        location: form.location.trim(),
        regionName: form.regionName.trim(),
        category: form.category,
        description: form.description.trim(),
        pricePerNight: Number(form.pricePerNight),
        maxGuests: Number(form.maxGuests),
        latitude: Number(form.latitude),
        longtitude: Number(form.longtitude),
        amenityIds: form.amenityIds,
        photos,
      })
      setIsDone(true)
      setSubmissions(await getMySubmissions(accessToken))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не вдалося надіслати заявку')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startOver() {
    setForm(EMPTY_FORM)
    setPhotos([])
    setStep(1)
    setIsDone(false)
    setError(null)
  }

  const header = (
    <header className="host__header">
      <a
        href="/"
        className="host__logo"
        onClick={(event) => {
          event.preventDefault()
          onHome?.()
        }}
      >
        HomeFU
      </a>
      <div className="host__header-actions">
        <span className="host__host-link">Запропонувати помешкання на HomeFU</span>
        <UserMenu {...menu} />
      </div>
    </header>
  )

  if (!user) {
    return (
      <div className="host">
        {header}
        <p className="host__status" role="status">{loadError ?? 'Завантаження…'}</p>
      </div>
    )
  }

  if (!user.isVerified) {
    return (
      <div className="host">
        {header}
        <main className="host__gate">
          <h1 className="host__title">Спочатку підтвердіть особу</h1>
          <p className="host__text">
            Щоб запропонувати помешкання на <span className="host__brand">HomeFU</span>, потрібно
            пройти верифікацію особи. Це займе кілька хвилин.
          </p>
          <button type="button" className="host__primary" onClick={onVerify}>
            Пройти верифікацію
          </button>
        </main>
      </div>
    )
  }

  const submissionsList = submissions.length > 0 && (
    <section className="host__mine" aria-label="Мої заявки">
      <h2 className="host__subtitle">Мої заявки</h2>
      <ul>
        {submissions.map((item) => (
          <li key={item.id} className="host__mine-item">
            <span className="host__mine-thumb">
              {item.images[0] && <img src={item.images[0].imageUrl} alt="" />}
            </span>
            <span className="host__mine-copy">
              <strong>{item.title}</strong>
              <span>{item.location}</span>
              {item.status === 'Rejected' && item.rejectionReason && (
                <span className="host__mine-reason">Причина: {item.rejectionReason}</span>
              )}
            </span>
            <span className={`host__badge host__badge--${item.status.toLowerCase()}`}>
              {STATUS_LABELS[item.status]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )

  if (isDone) {
    return (
      <div className="host">
        {header}
        <main className="host__gate">
          <h1 className="host__title">Заявку надіслано</h1>
          <p className="host__text">
            Дякуємо! Ми перевіримо ваше помешкання, і після схвалення воно з'явиться в каталозі
            <span className="host__brand"> HomeFU</span>. Статус заявки можна відстежувати нижче.
          </p>
          <div className="host__actions host__actions--start">
            <button type="button" className="host__primary" onClick={onHome}>На головну</button>
            <button type="button" className="host__back" onClick={startOver}>Додати ще одне</button>
          </div>
          {submissionsList}
        </main>
      </div>
    )
  }

  return (
    <div className="host">
      {header}
      <main className="host__body">
        <form className="host__col" onSubmit={handleSubmit}>
          <p className="host__step">Крок {step} з 3</p>

          {step === 1 && (
            <>
              <h1 className="host__title">Розкажіть про своє помешкання</h1>
              <p className="host__text">Ці відомості побачать гості в оголошенні.</p>
              <label className="host__field">
                <span>Назва</span>
                <input maxLength={160} value={form.title} onChange={(e) => update('title', e.target.value)} />
              </label>
              <label className="host__field">
                <span>Категорія</span>
                <select value={form.category} onChange={(e) => update('category', e.target.value)}>
                  <option value="">Оберіть категорію</option>
                  {LISTING_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="host__field">
                <span>Регіон (оберіть зі списку або впишіть свій)</span>
                <input
                  list="host-regions"
                  maxLength={100}
                  placeholder="Наприклад, Київська область"
                  value={form.regionName}
                  onChange={(e) => update('regionName', e.target.value)}
                />
                <datalist id="host-regions">
                  {regions.map((region) => <option key={region.id} value={region.name} />)}
                </datalist>
              </label>
              <label className="host__field">
                <span>Адреса / місто</span>
                <input maxLength={160} value={form.location} onChange={(e) => update('location', e.target.value)} />
              </label>
              <div className="host__row">
                <label className="host__field">
                  <span>Широта</span>
                  <input type="number" step="any" min={-90} max={90} value={form.latitude} onChange={(e) => update('latitude', e.target.value)} />
                </label>
                <label className="host__field">
                  <span>Довгота</span>
                  <input type="number" step="any" min={-180} max={180} value={form.longtitude} onChange={(e) => update('longtitude', e.target.value)} />
                </label>
              </div>
              <div className="host__actions host__actions--end">
                <button type="button" className="host__primary" disabled={!step1Valid} onClick={() => setStep(2)}>
                  Далі
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="host__title">Деталі та зручності</h1>
              <p className="host__text">Вкажіть ціну, місткість і опишіть, чим особливе ваше помешкання.</p>
              <div className="host__row">
                <label className="host__field">
                  <span>Ціна за ніч, USD</span>
                  <input type="number" min={1} step="0.01" value={form.pricePerNight} onChange={(e) => update('pricePerNight', e.target.value)} />
                </label>
                <label className="host__field">
                  <span>Макс. гостей</span>
                  <input type="number" min={1} max={30} value={form.maxGuests} onChange={(e) => update('maxGuests', e.target.value)} />
                </label>
              </div>
              <label className="host__field">
                <span>Опис</span>
                <textarea rows={5} maxLength={5000} value={form.description} onChange={(e) => update('description', e.target.value)} />
              </label>
              {amenities.length > 0 && (
                <fieldset className="host__amenities">
                  <legend>Зручності</legend>
                  {amenities.map((amenity) => (
                    <label key={amenity.id}>
                      <input
                        type="checkbox"
                        checked={form.amenityIds.includes(amenity.id)}
                        onChange={(e) => update('amenityIds', e.target.checked
                          ? [...form.amenityIds, amenity.id]
                          : form.amenityIds.filter((id) => id !== amenity.id))}
                      />
                      {amenity.name}
                    </label>
                  ))}
                </fieldset>
              )}
              <div className="host__actions">
                <button type="button" className="host__back" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} aria-hidden /> Назад
                </button>
                <button type="button" className="host__primary" disabled={!step2Valid} onClick={() => setStep(3)}>
                  Далі
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="host__title">Додайте фото</h1>
              <p className="host__text">Додайте від 1 до {MAX_PHOTOS} фото (JPEG, PNG або WebP, до 12 МБ). Перше фото стане обкладинкою.</p>
              <div className="host__photos">
                {photos.map((file, index) => (
                  <PhotoTile key={`${file.name}-${index}`} file={file} onRemove={() => setPhotos((c) => c.filter((_, i) => i !== index))} />
                ))}
                {photos.length < MAX_PHOTOS && (
                  <label className="host__tile">
                    <ImagePlus size={28} strokeWidth={1.5} aria-hidden />
                    <span className="host__tile-label">Додати фото</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotos} />
                  </label>
                )}
              </div>
              {error && <p className="host__error" role="alert">{error}</p>}
              <div className="host__actions">
                <button type="button" className="host__back" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} aria-hidden /> Назад
                </button>
                <button type="submit" className="host__primary" disabled={photos.length === 0 || isSubmitting}>
                  {isSubmitting ? 'Надсилання…' : 'Надіслати на перевірку'}
                </button>
              </div>
            </>
          )}
        </form>

        <aside className="host__aside">
          <h2>Як це працює</h2>
          <p>Ви заповнюєте анкету помешкання та додаєте фото.</p>
          <p>Адміністратор HomeFU перевіряє заявку. Після схвалення оголошення з'являється в каталозі.</p>
          <p>Якщо заявку відхилено, ви побачите причину в списку «Мої заявки».</p>
        </aside>
      </main>
      {submissions.length > 0 && <div className="host__below">{submissionsList}</div>}
    </div>
  )
}
