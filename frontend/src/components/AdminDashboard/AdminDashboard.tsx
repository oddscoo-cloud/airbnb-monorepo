import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { AdminListingForm } from './AdminListingForm'
import { AdminListingList } from './AdminListingList'
import type { AdminAmenity, AdminImage, AdminListing, ListingForm } from './adminTypes'
import { apiRequest } from '../../api/http'
import './AdminDashboard.css'

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

async function adminRequest<T>(accessToken: string, url: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    accessToken,
    fallbackError: (status) => `Запит не виконано (${status})`,
  })
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

  const loadData = useCallback(async () => {
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
  }, [accessToken])

  useEffect(() => {
    void loadData()
  }, [loadData])

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
        <AdminListingList
          listings={listings}
          isLoading={isLoading}
          selectedId={selectedId}
          onEdit={startEdit}
          onTogglePublished={(listing) => void togglePublished(listing)}
        />

        <AdminListingForm
          selectedId={selectedId}
          form={form}
          amenities={amenities}
          selectedImages={selectedImages}
          files={files}
          isSaving={isSaving}
          onUpdate={update}
          onFilesChange={setFiles}
          onDeleteImage={(image) => void deleteImage(image)}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  )
}
