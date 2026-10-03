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

export function mapListingResponse(item: ListingResponse): Listing {
  const images = item.images ?? []
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

export async function getListings(): Promise<Listing[]> {
  const data = await apiRequest<ListingResponse[]>('/api/listings', {
    fallbackError: (status) => `Не вдалося завантажити помешкання (${status})`,
  })
  return data.map(mapListingResponse)
}
