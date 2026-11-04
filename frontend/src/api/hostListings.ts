import { apiRequest } from './http'

export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected'

export interface HostAmenity {
  id: number
  name: string
  icon: string
}

export interface SubmissionImage {
  id: number
  imageUrl: string
  isCover: boolean
}

export interface ListingSubmission {
  id: number
  hostId: number
  hostEmail: string
  hostName: string | null
  title: string
  location: string | null
  region: string | null
  category: string | null
  description: string | null
  pricePerNight: number
  maxGuests: number
  latitude: number
  longtitude: number
  status: SubmissionStatus
  rejectionReason: string | null
  submittedAt: string | null
  reviewedAt: string | null
  images: SubmissionImage[]
  amenities: HostAmenity[]
}

export interface SubmissionInput {
  title: string
  location: string
  regionId: number | null
  category: string
  description: string
  pricePerNight: number
  maxGuests: number
  latitude: number
  longtitude: number
  amenityIds: number[]
  photos: File[]
}

export const LISTING_CATEGORIES = [
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

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  Pending: 'На розгляді',
  Approved: 'Схвалено',
  Rejected: 'Відхилено',
}

export function getHostAmenities(accessToken: string, signal?: AbortSignal) {
  return apiRequest<HostAmenity[]>('/api/host/listings/amenities', { accessToken, signal })
}

export function getMySubmissions(accessToken: string, signal?: AbortSignal) {
  return apiRequest<ListingSubmission[]>('/api/host/listings/mine', { accessToken, signal })
}

export function submitListing(accessToken: string, input: SubmissionInput, signal?: AbortSignal) {
  const form = new FormData()
  form.append('title', input.title)
  form.append('location', input.location)
  if (input.regionId !== null) form.append('regionId', String(input.regionId))
  form.append('category', input.category)
  form.append('description', input.description)
  form.append('pricePerNight', String(input.pricePerNight))
  form.append('maxGuests', String(input.maxGuests))
  form.append('latitude', String(input.latitude))
  form.append('longtitude', String(input.longtitude))
  input.amenityIds.forEach((id) => form.append('amenityIds', String(id)))
  input.photos.forEach((photo) => form.append('photos', photo))
  return apiRequest<ListingSubmission>('/api/host/listings', {
    method: 'POST',
    accessToken,
    signal,
    body: form,
    fallbackError: (status) => `Не вдалося надіслати заявку (${status})`,
  })
}

export function getSubmissions(accessToken: string, status?: SubmissionStatus, signal?: AbortSignal) {
  const query = status ? `?status=${status}` : ''
  return apiRequest<ListingSubmission[]>(`/api/admin/submissions${query}`, { accessToken, signal })
}

export function approveSubmission(accessToken: string, id: number) {
  return apiRequest<void>(`/api/admin/submissions/${id}/approve`, { method: 'POST', accessToken })
}

export function rejectSubmission(accessToken: string, id: number, reason: string) {
  return apiRequest<void>(`/api/admin/submissions/${id}/reject`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ reason }),
  })
}
