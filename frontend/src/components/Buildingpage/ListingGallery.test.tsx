import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Listing } from '../../types/listing'
import { LanguageProvider } from '../../i18n'
import { ListingGallery } from './ListingGallery'

const listing: Listing = {
  id: '42',
  title: 'Помешкання',
  description: null,
  location: 'Київ',
  category: '',
  region: '',
  price: 100,
  rating: null,
  reviewCount: 0,
  maxGuests: 2,
  amenities: [],
  reviews: [],
  isPublished: true,
  image: '/1.jpg',
  gallery: Array.from({ length: 7 }, (_, index) => `/${index + 1}.jpg`),
  latitude: 0,
  longitude: 0,
}

describe('ListingGallery', () => {
  it('renders every listing photo in order and makes every fifth photo wide', () => {
    const markup = renderToStaticMarkup(
      <LanguageProvider>
        <ListingGallery listing={listing} isSaved={false} onBack={() => {}} />
      </LanguageProvider>,
    )
    const photos = [...markup.matchAll(/<img\b[^>]*>/g)].map(([image]) => image)

    expect(photos).toHaveLength(7)
    photos.forEach((photo, index) => {
      expect(photo).toContain(`src="/${index + 1}.jpg"`)
      expect(photo).toContain(`фото ${index + 1}`)
      expect(photo.includes('listing-gallery__photo--wide')).toBe(index === 4)
    })
  })

  it('shows the saved state and handles listings without photos', () => {
    const markup = renderToStaticMarkup(
      <LanguageProvider>
        <ListingGallery listing={{ ...listing, gallery: [] }} isSaved onBack={() => {}} />
      </LanguageProvider>,
    )

    expect(markup).not.toContain('<img')
    expect(markup).toContain('Збережено')
    expect(markup).toContain('aria-pressed="true"')
  })
})
