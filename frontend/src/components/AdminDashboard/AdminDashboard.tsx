import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff, Plus, Save, Trash2, Upload } from 'lucide-react'
import './AdminDashboard.css'

interface AdminAmenity {
  id: number
  name: string
  icon: string
}

interface AdminImage {
  id: number
  imageUrl: string
  isCover: boolean
}

interface AdminListing {
  id: number
  title: string
  location: string | null
  region: string | null
  category: string | null
  description: string | null
  isPublished: boolean
  pricePerNight: number
  maxGuests: number
  latitude: number
  longtitude: number
  images: AdminImage[]
  amenities: AdminAmenity[]
  reviewCount: number
  rating: number | null
}

interface ListingForm {
  title: string
  location: string
  region: string
  category: string
  description: string
  pricePerNight: string
  maxGuests: string
  latitude: string
  longtitude: string
  amenityIds: number[]
  publishAfterSave: boolean
}

interface AdminDashboardProps {
  accessToken: string
  onBack: () => void
  onSaved: () => void
}

const EMPTY_FORM: ListingForm = {
  title: '',
  location: '',
  region: '',
  category: '',
  description: '',
  pricePerNight: '',
  maxGuests: '2',
  latitude: '50.4501',
  longtitude: '30.5234',
  amenityIds: [],
  publishAfterSave: false,
}

const CATEGORIES = [
  'Гарні краєвиди',
  'Невеликі квартири',
  'Великі квартири',
  'Кімнати',
  'Хостели',
  'Люкс',
  'У центрі міста',
  'Сільська місцевість',
  'Від дизайнера',
  'Біля моря',
  'Особняки',
  'Легендарне',
]

async function adminRequest<T>(accessToken: string, url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')

  const response = await fetch(url, { ...options, headers })
  const body = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.message ?? `Запит не виконано (${response.status})`)
  return body as T
}

export function AdminDashboard({ accessToken, onBack, onSaved }: AdminDashboardProps) {
  const [listings, setListings] = useState<AdminListing[]>([])
  const [amenities, setAmenities] = useState<AdminAmenity[]>([])
  const [form, setForm] = useState<ListingForm>(EMPTY_FORM)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedImages, setSelectedImages] = useState<AdminImage[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadData() {
    setIsLoading(true)
    setError('')
    try {
      const [listingData, amenityData] = await Promise.all([
        adminRequest<AdminListing[]>(accessToken, '/api/admin/listings'),
        adminRequest<AdminAmenity[]>(accessToken, '/api/admin/listings/amenities'),
      ])
      setListings(listingData)
      setAmenities(amenityData)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Не вдалося завантажити адмін-дані')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [accessToken])

  function startNew() {
    setSelectedId(null)
    setSelectedImages([])
    setFiles([])
    setForm(EMPTY_FORM)
    setNotice('')
    setError('')
  }

  function startEdit(listing: AdminListing) {
    setSelectedId(listing.id)
    setSelectedImages(listing.images)
    setFiles([])
    setNotice('')
    setError('')
    setForm({
      title: listing.title,
      location: listing.location ?? '',
      region: listing.region ?? '',
      category: listing.category ?? '',
      description: listing.description ?? '',
      pricePerNight: String(listing.pricePerNight),
      maxGuests: String(listing.maxGuests),
      latitude: String(listing.latitude),
      longtitude: String(listing.longtitude),
      amenityIds: listing.amenities.map((amenity) => amenity.id),
      publishAfterSave: listing.isPublished,
    })
  }

  function update<K extends keyof ListingForm>(field: K, value: ListingForm[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setNotice('')

    try {
      const payload = {
        title: form.title,
        location: form.location,
        region: form.region,
        category: form.category,
        description: form.description,
        pricePerNight: Number(form.pricePerNight),
        maxGuests: Number(form.maxGuests),
        latitude: Number(form.latitude),
        longtitude: Number(form.longtitude),
        amenityIds: form.amenityIds,
      }
      const saved = await adminRequest<AdminListing>(
        accessToken,
        selectedId === null ? '/api/admin/listings' : `/api/admin/listings/${selectedId}`,
        { method: selectedId === null ? 'POST' : 'PUT', body: JSON.stringify(payload) },
      )
      setSelectedId(saved.id)
      setSelectedImages(saved.images)

      let images = saved.images
      for (const [index, file] of files.entries()) {
        const imageForm = new FormData()
        imageForm.append('file', file)
        imageForm.append('isCover', String(index === 0 && !images.some((image) => image.isCover)))
        const uploaded = await adminRequest<AdminImage>(accessToken, `/api/admin/listings/${saved.id}/images`, {
          method: 'POST',
          body: imageForm,
        })
        images = [...images, uploaded]
      }
      setSelectedImages(images)
      setFiles([])

      if (form.publishAfterSave !== saved.isPublished) {
        await adminRequest<void>(accessToken, `/api/admin/listings/${saved.id}/publish`, {
          method: 'POST',
          body: JSON.stringify({ isPublished: form.publishAfterSave }),
        })
      }

      setNotice(form.publishAfterSave ? 'Объявление сохранено и опубликовано.' : 'Черновик сохранён.')
      await loadData()
      onSaved()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не вдалося зберегти оголошення')
    } finally {
      setIsSaving(false)
    }
  }

  async function togglePublished(listing: AdminListing) {
    setError('')
    setNotice('')
    try {
      await adminRequest<void>(accessToken, `/api/admin/listings/${listing.id}/publish`, {
        method: 'POST',
        body: JSON.stringify({ isPublished: !listing.isPublished }),
      })
      setNotice(listing.isPublished ? 'Объявление снято с публикации.' : 'Объявление опубликовано.')
      await loadData()
      onSaved()
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Не вдалося змінити публікацію')
    }
  }

  async function deleteImage(image: AdminImage) {
    if (selectedId === null) return
    try {
      await adminRequest<void>(accessToken, `/api/admin/listings/${selectedId}/images/${image.id}`, { method: 'DELETE' })
      setSelectedImages((current) => current.filter((item) => item.id !== image.id))
      onSaved()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Не вдалося видалити фото')
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <button type="button" className="admin-icon-button" onClick={onBack} aria-label="На сайт">
          <ArrowLeft size={18} aria-hidden />
        </button>
        <div>
          <p className="admin-eyebrow">HOMEFU · КЕРУВАННЯ</p>
          <h1>Оголошення</h1>
        </div>
        <button type="button" className="admin-primary-button" onClick={startNew}>
          <Plus size={16} aria-hidden /> Нове оголошення
        </button>
      </header>

      {(error || notice) && <p className={`admin-message${error ? ' admin-message--error' : ''}`} role={error ? 'alert' : 'status'}>{error || notice}</p>}

      <div className="admin-layout">
        <section className="admin-list-panel" aria-label="Список объявлений">
          <div className="admin-panel-heading">
            <h2>Усі оголошення</h2>
            <span>{listings.length}</span>
          </div>
          {isLoading ? <p className="admin-empty">Завантаження…</p> : listings.length === 0 ? <p className="admin-empty">Оголошень поки немає.</p> : (
            <ul className="admin-list">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <button type="button" className={`admin-list-item${selectedId === listing.id ? ' admin-list-item--active' : ''}`} onClick={() => startEdit(listing)}>
                    <span className="admin-list-item__image">
                      {listing.images[0] && <img src={listing.images[0].imageUrl} alt="" />}
                    </span>
                    <span className="admin-list-item__copy">
                      <strong>{listing.title}</strong>
                      <span>{listing.location || 'Адреса не указана'}</span>
                      <span className={`admin-status${listing.isPublished ? ' admin-status--published' : ''}`}>
                        {listing.isPublished ? 'Опубликовано' : 'Черновик'} · ${listing.pricePerNight}/ніч
                      </span>
                    </span>
                  </button>
                  <button type="button" className="admin-icon-button admin-list-item__publish" onClick={() => void togglePublished(listing)} aria-label={listing.isPublished ? 'Снять с публикации' : 'Опубликовать'}>
                    {listing.isPublished ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-form-panel" aria-label="Форма объявления">
          <div className="admin-panel-heading">
            <h2>{selectedId === null ? 'Новое объявление' : `Объявление #${selectedId}`}</h2>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label className="admin-field admin-field--wide">
              <span>Название</span>
              <input required maxLength={160} value={form.title} onChange={(event) => update('title', event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Адрес / город</span>
              <input required maxLength={160} value={form.location} onChange={(event) => update('location', event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Регион</span>
              <input required maxLength={120} value={form.region} onChange={(event) => update('region', event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Категория</span>
              <select required value={form.category} onChange={(event) => update('category', event.target.value)}>
                <option value="">Выберите категорию</option>
                {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="admin-field">
              <span>Цена за ночь, USD</span>
              <input required type="number" min="1" step="0.01" value={form.pricePerNight} onChange={(event) => update('pricePerNight', event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Максимум гостей</span>
              <input required type="number" min="1" max="30" value={form.maxGuests} onChange={(event) => update('maxGuests', event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Широта</span>
              <input required type="number" min="-90" max="90" step="any" value={form.latitude} onChange={(event) => update('latitude', event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Долгота</span>
              <input required type="number" min="-180" max="180" step="any" value={form.longtitude} onChange={(event) => update('longtitude', event.target.value)} />
            </label>
            <label className="admin-field admin-field--wide">
              <span>Описание</span>
              <textarea rows={5} maxLength={5000} value={form.description} onChange={(event) => update('description', event.target.value)} />
            </label>

            <fieldset className="admin-fieldset admin-field--wide">
              <legend>Удобства</legend>
              {amenities.length === 0 ? <p>Список удобств пока пуст.</p> : (
                <div className="admin-checkboxes">
                  {amenities.map((amenity) => (
                    <label key={amenity.id}>
                      <input
                        type="checkbox"
                        checked={form.amenityIds.includes(amenity.id)}
                        onChange={(event) => update('amenityIds', event.target.checked
                          ? [...form.amenityIds, amenity.id]
                          : form.amenityIds.filter((id) => id !== amenity.id))}
                      />
                      {amenity.name}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <div className="admin-field admin-field--wide">
              <span>Фотографии</span>
              {selectedImages.length > 0 && <div className="admin-image-list">
                {selectedImages.map((image) => (
                  <div key={image.id} className="admin-image-item">
                    <img src={image.imageUrl} alt="Фото объявления" />
                    {image.isCover && <span>Обложка</span>}
                    <button type="button" className="admin-icon-button" onClick={() => void deleteImage(image)} aria-label="Удалить фото">
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>
                ))}
              </div>}
              <label className="admin-upload">
                <Upload size={17} aria-hidden /> Выбрать фото
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
              </label>
              {files.length > 0 && <span className="admin-file-note">Выбрано файлов: {files.length}</span>}
            </div>

            <label className="admin-publish-check admin-field--wide">
              <input type="checkbox" checked={form.publishAfterSave} onChange={(event) => update('publishAfterSave', event.target.checked)} />
              Опубликовать после сохранения
            </label>
            <div className="admin-form-actions admin-field--wide">
              <button className="admin-primary-button" type="submit" disabled={isSaving}>
                <Save size={16} aria-hidden /> {isSaving ? 'Сохранение…' : 'Сохранить объявление'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
