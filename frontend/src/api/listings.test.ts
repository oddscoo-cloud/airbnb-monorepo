import { describe, expect, it } from 'vitest'
import { buildListingsUrl, mapListingRegionResponse, mapListingResponse, type ListingResponse } from './listings'

describe('buildListingsUrl', () => {
  it('serializes supported filters and skips empty values', () => {
    const url = new URL(buildListingsUrl({
      region: 'Київ',
      category: 'Люкс',
      minPrice: 50,
      maxPrice: null,
      minimumRating: 4.5,
      guests: 3,
      checkIn: '2026-11-01',
      checkOut: '2026-11-05',
    }), 'http://localhost')

    expect(Object.fromEntries(url.searchParams.entries())).toEqual({
      page: '1',
      pageSize: '100',
      region: 'Київ',
      category: 'Люкс',
      minPrice: '50',
      minimumRating: '4.5',
      guests: '3',
      checkIn: '2026-11-01',
      checkOut: '2026-11-05',
    })
  })
})

describe('mapListingResponse', () => {
  // Проверка преобразования полей API и приоритета обложки.
  it('uses the cover image first and maps API fields to the listing model', () => {
    const response: ListingResponse = {
      id: 42,
      title: 'City apartment',
      description: 'Near the center',
      pricePerNight: 125,
      maxGuests: 3,
      latitude: 50.45,
      longtitude: 30.52,
      location: 'Kyiv',
      region: 'Kyiv region',
      category: 'Apartments',
      images: [
        { imageUrl: '/listing-images/room.jpg', isCover: false },
        { imageUrl: '/listing-images/cover.jpg', isCover: true },
      ],
      amenities: [{ id: 1, name: 'Wi-Fi', icon: 'wifi' }],
      reviews: [],
      isPublished: true,
      rating: 4.8,
      reviewCount: 12,
    }

    expect(mapListingResponse(response)).toMatchObject({
      id: '42',
      location: 'Kyiv',
      price: 125,
      image: '/listing-images/cover.jpg',
      gallery: ['/listing-images/cover.jpg', '/listing-images/room.jpg'],
      latitude: 50.45,
      longitude: 30.52,
    })
  })

  describe('mapListingRegionResponse', () => {
    it('preserves region coordinates for map previews', () => {
      expect(mapListingRegionResponse({
        name: 'Центр',
        latitude: 49.84,
        longitude: 24.03,
      })).toEqual({
        name: 'Центр',
        latitude: 49.84,
        longitude: 24.03,
      })
    })

    it('keeps compatibility with region names that have no coordinates', () => {
      expect(mapListingRegionResponse('Центр')).toEqual({
        name: 'Центр',
        latitude: null,
        longitude: null,
      })
    })
  })

  // Проверка значений по умолчанию для необязательных полей.
  it('provides defaults when optional listing data is absent', () => {
    const response: ListingResponse = {
      id: 7,
      title: 'Quiet room',
      description: null,
      pricePerNight: 60,
      maxGuests: 1,
      latitude: 0,
      longtitude: 0,
      location: null,
      region: null,
      category: null,
      isPublished: false,
      rating: null,
      reviewCount: 0,
    }

    expect(mapListingResponse(response)).toMatchObject({
      location: 'Quiet room',
      category: '',
      region: '',
      amenities: [],
      reviews: [],
      image: '',
      gallery: [],
    })
  })
})
