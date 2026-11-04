// Типы данных административного API и формы (числовые поля формы представлены строками).
export interface AdminAmenity {
  id: number
  name: string
  icon: string
}

export interface AdminImage {
  id: number
  imageUrl: string
  isCover: boolean
}

export interface AdminListing {
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

export interface ListingForm {
  title: string
  location: string
  // Название региона; новое название создаёт регион при сохранении.
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
