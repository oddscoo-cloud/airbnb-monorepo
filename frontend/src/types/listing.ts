export interface ListingAmenity {
  id: number
  name: string
  icon: string
}

export interface ListingReview {
  id: number
  rating: number
  comment: string
  createdAt: string
  authorName?: string | null
  avatarUrl?: string | null
}

export interface Listing {
  id: string
  title: string
  description: string | null
  location: string
  category: string
  region: string
  price: number
  rating: number | null
  reviewCount: number
  maxGuests: number
  amenities: ListingAmenity[]
  reviews: ListingReview[]
  isPublished: boolean
  image: string
  gallery?: string[]
  latitude: number
  longitude: number
}
