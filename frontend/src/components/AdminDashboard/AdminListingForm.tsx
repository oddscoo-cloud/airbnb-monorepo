import type { FormEvent } from 'react'
import { Save, Trash2, Upload } from 'lucide-react'
import type { AdminAmenity, AdminImage, ListingForm } from './adminTypes'
import type { Region } from '../../api/regions'

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

type AdminListingFormProps = {
  selectedId: number | null
  form: ListingForm
  amenities: AdminAmenity[]
  regions: Region[]
  selectedImages: AdminImage[]
  files: File[]
  isSaving: boolean
  onUpdate: <K extends keyof ListingForm>(field: K, value: ListingForm[K]) => void
  onFilesChange: (files: File[]) => void
  onDeleteImage: (image: AdminImage) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function AdminListingForm({
  selectedId,
  form,
  amenities,
  regions,
  selectedImages,
  files,
  isSaving,
  onUpdate,
  onFilesChange,
  onDeleteImage,
  onSubmit,
}: AdminListingFormProps) {
  return (
    // Controlled-форма; значения и обработчики принадлежат AdminDashboard.
    <section className="admin-form-panel" aria-label="Форма объявления">
      <div className="admin-panel-heading">
        <h2>{selectedId === null ? 'Новое объявление' : `Объявление #${selectedId}`}</h2>
      </div>
      <form className="admin-form" onSubmit={onSubmit}>
        <label className="admin-field admin-field--wide">
          <span>Название</span>
          <input required maxLength={160} value={form.title} onChange={(event) => onUpdate('title', event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Адрес / город</span>
          <input required maxLength={160} value={form.location} onChange={(event) => onUpdate('location', event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Регион</span>
          <input list="admin-regions" maxLength={100} placeholder="Выберите или впишите новый" value={form.region} onChange={(event) => onUpdate('region', event.target.value)} />
          <datalist id="admin-regions">
            {regions.map((region) => <option key={region.id} value={region.name} />)}
          </datalist>
        </label>
        <label className="admin-field">
          <span>Категория</span>
          <select required value={form.category} onChange={(event) => onUpdate('category', event.target.value)}>
            <option value="">Выберите категорию</option>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="admin-field">
          <span>Цена за ночь, USD</span>
          <input required type="number" min="1" step="0.01" value={form.pricePerNight} onChange={(event) => onUpdate('pricePerNight', event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Максимум гостей</span>
          <input required type="number" min="1" max="30" value={form.maxGuests} onChange={(event) => onUpdate('maxGuests', event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Широта</span>
          <input required type="number" min="-90" max="90" step="any" value={form.latitude} onChange={(event) => onUpdate('latitude', event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Долгота</span>
          <input required type="number" min="-180" max="180" step="any" value={form.longtitude} onChange={(event) => onUpdate('longtitude', event.target.value)} />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Описание</span>
          <textarea rows={5} maxLength={5000} value={form.description} onChange={(event) => onUpdate('description', event.target.value)} />
        </label>

        <fieldset className="admin-fieldset admin-field--wide">
          <legend>Удобства</legend>
          {amenities.length === 0 ? <p>Список удобств пока пуст.</p> : (
            <div className="admin-checkboxes">
              {/* Набор id выбранных удобств. */}
              {amenities.map((amenity) => (
                <label key={amenity.id}>
                  <input
                    type="checkbox"
                    checked={form.amenityIds.includes(amenity.id)}
                    onChange={(event) => onUpdate('amenityIds', event.target.checked
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
          {/* Раздельное отображение сохранённых изображений и новых файлов. */}
          {selectedImages.length > 0 && <div className="admin-image-list">
            {selectedImages.map((image) => (
              <div key={image.id} className="admin-image-item">
                <img src={image.imageUrl} alt="Фото объявления" />
                {image.isCover && <span>Обложка</span>}
                <button type="button" className="admin-icon-button" onClick={() => onDeleteImage(image)} aria-label="Удалить фото">
                  <Trash2 size={15} aria-hidden />
                </button>
              </div>
            ))}
          </div>}
          {/* Видимая метка для скрытого input выбора файлов. */}
          <label className="admin-upload">
            <Upload size={17} aria-hidden /> Выбрать фото
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => onFilesChange(Array.from(event.target.files ?? []))} />
          </label>
          {files.length > 0 && <span className="admin-file-note">Выбрано файлов: {files.length}</span>}
        </div>

        <label className="admin-publish-check admin-field--wide">
          <input type="checkbox" checked={form.publishAfterSave} onChange={(event) => onUpdate('publishAfterSave', event.target.checked)} />
          Опубликовать после сохранения
        </label>
        <div className="admin-form-actions admin-field--wide">
          <button className="admin-primary-button" type="submit" disabled={isSaving}>
            <Save size={16} aria-hidden /> {isSaving ? 'Сохранение…' : 'Сохранить объявление'}
          </button>
        </div>
      </form>
    </section>
  )
}
