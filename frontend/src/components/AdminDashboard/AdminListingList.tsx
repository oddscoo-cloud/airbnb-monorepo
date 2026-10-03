import { Eye, EyeOff } from 'lucide-react'
import type { AdminListing } from './adminTypes'

type AdminListingListProps = {
  listings: AdminListing[]
  isLoading: boolean
  selectedId: number | null
  onEdit: (listing: AdminListing) => void
  onTogglePublished: (listing: AdminListing) => void
}

export function AdminListingList({ listings, isLoading, selectedId, onEdit, onTogglePublished }: AdminListingListProps) {
  return (
    <section className="admin-list-panel" aria-label="Список объявлений">
      <div className="admin-panel-heading">
        <h2>Усі оголошення</h2>
        <span>{listings.length}</span>
      </div>
      {isLoading ? <p className="admin-empty">Завантаження…</p> : listings.length === 0 ? <p className="admin-empty">Оголошень поки немає.</p> : (
        <ul className="admin-list">
          {listings.map((listing) => (
            <li key={listing.id}>
              <button type="button" className={`admin-list-item${selectedId === listing.id ? ' admin-list-item--active' : ''}`} onClick={() => onEdit(listing)}>
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
              <button type="button" className="admin-icon-button admin-list-item__publish" onClick={() => onTogglePublished(listing)} aria-label={listing.isPublished ? 'Снять с публикации' : 'Опубликовать'}>
                {listing.isPublished ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
