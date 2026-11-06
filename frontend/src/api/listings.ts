import type { Listing } from '../types/listing'
import { apiRequest } from './http'

export interface ListingResponse {
  id: number
  title: string
  description: string | null
  pricePerNight: number
  maxGuests: number
  latitude: number
  longtitude: number
  location: string | null
  region: string | null
  category: string | null
  images?: { imageUrl: string; isCover: boolean }[]
  amenities?: { id: number; name: string; icon: string }[]
  reviews?: { id: number; rating: number; comment: string; createdAt: string; authorName: string | null; avatarUrl: string | null }[]
  isPublished: boolean
  rating: number | null
  reviewCount: number
}

export interface ListingSearchFilters {
  region?: string | null
  category?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  minimumRating?: number | null
  guests?: number | null
  checkIn?: string | null
  checkOut?: string | null
}

export interface ListingRegion {
  name: string
  latitude: number | null
  longitude: number | null
}

interface ListingRegionResponse {
  name: string
  latitude?: number | null
  longitude?: number | null
}

export function buildListingsUrl(filters: ListingSearchFilters = {}): string {
  const params = new URLSearchParams({ page: '1', pageSize: '100' })
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }
  return `/api/listings?${params.toString()}`
}

export function mapListingRegionResponse(region: string | ListingRegionResponse): ListingRegion {
  return typeof region === 'string'
    ? { name: region, latitude: null, longitude: null }
    : {
      name: region.name,
      latitude: region.latitude ?? null,
      longitude: region.longitude ?? null,
    }
}

export async function getListingRegions(signal?: AbortSignal): Promise<ListingRegion[]> {
  const regions = await apiRequest<(string | ListingRegionResponse)[]>('/api/listings/regions', { signal })
  return regions.map(mapListingRegionResponse)
}

// Преобразование ответа backend в общую UI-модель Listing.
export function mapListingResponse(item: ListingResponse): Listing {
  // Значения по умолчанию для отсутствующих списков.
  const images = item.images ?? []
  // Приоритет обложки в каталоге и галерее.
  const orderedImages = [...images].sort((left, right) => Number(right.isCover) - Number(left.isCover))

  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    location: item.location || item.title,
    category: item.category ?? '',
    region: item.region ?? '',
    price: item.pricePerNight,
    rating: item.rating,
    reviewCount: item.reviewCount,
    amenities: item.amenities ?? [],
    reviews: item.reviews ?? [],
    isPublished: item.isPublished,
    maxGuests: item.maxGuests,
    image: orderedImages[0]?.imageUrl ?? '',
    gallery: orderedImages.map((image) => image.imageUrl),
    latitude: item.latitude,
    longitude: item.longtitude,
  }
}

export async function getListings(filters: ListingSearchFilters = {}, signal?: AbortSignal): Promise<Listing[]> {
  // Загрузка DTO и преобразование каждой записи для UI.
  const data = await apiRequest<ListingResponse[]>(buildListingsUrl(filters), {
    signal,
    fallbackError: (status) => `Не вдалося завантажити помешкання (${status})`,
  })
  return data.map(mapListingResponse)
}
