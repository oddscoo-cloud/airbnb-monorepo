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

const LISTINGS_PAGE_SIZE = 100
const FALLBACK_LISTING_PHOTOS = Array.from(
  { length: 51 },
  (_, index) => `/listing-photos/fallback-${String(index + 1).padStart(2, '0')}.webp`,
)

function getFallbackListingPhotos(listingId: number): string[] {
  const firstPhotoIndex = ((Math.abs(listingId) - 1) * 7 % FALLBACK_LISTING_PHOTOS.length
    + FALLBACK_LISTING_PHOTOS.length) % FALLBACK_LISTING_PHOTOS.length
  return Array.from({ length: 5 }, (_, index) =>
    FALLBACK_LISTING_PHOTOS[(firstPhotoIndex + index * 7) % FALLBACK_LISTING_PHOTOS.length],
  )
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

export function buildListingsUrl(filters: ListingSearchFilters = {}, page = 1): string {
  const params = new URLSearchParams({ page: String(page), pageSize: String(LISTINGS_PAGE_SIZE) })
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
  const gallery = orderedImages.length
    ? orderedImages.map((image) => image.imageUrl)
    : getFallbackListingPhotos(item.id)

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
    image: gallery[0] ?? '',
    gallery,
    latitude: item.latitude,
    longitude: item.longtitude,
  }
}

export async function getListings(filters: ListingSearchFilters = {}, signal?: AbortSignal): Promise<Listing[]> {
  const listings: Listing[] = []
  let page = 1
  let data: ListingResponse[]
  do {
    data = await apiRequest<ListingResponse[]>(buildListingsUrl(filters, page), {
      signal,
      fallbackError: (status) => `Не вдалося завантажити помешкання (${status})`,
    })
    listings.push(...data.map(mapListingResponse))
    page += 1
  } while (data.length === LISTINGS_PAGE_SIZE)
  return listings
}
