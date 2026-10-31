import { apiRequest } from './http'
import type { Listing } from '../types/listing'
import { mapListingResponse, type ListingResponse } from './listings'

const BASE = '/api/saved-listings'

/** Повертає повні об'єкти збережених оголошень поточного користувача. */
export async function getSavedListings(
  accessToken: string,
  signal?: AbortSignal,
): Promise<Listing[]> {
  const data = await apiRequest<ListingResponse[]>(BASE, { accessToken, signal })
  return data.map(mapListingResponse)
}

/** Повертає масив id збережених оголошень (швидка перевірка стану серця). */
export async function getSavedListingIds(
  accessToken: string,
  signal?: AbortSignal,
): Promise<number[]> {
  return apiRequest<number[]>(`${BASE}/ids`, { accessToken, signal })
}

/** Зберегти оголошення. */
export async function saveListing(
  listingId: number,
  accessToken: string,
): Promise<void> {
  await apiRequest<void>(`${BASE}/${listingId}`, {
    method: 'POST',
    accessToken,
  })
}

/** Видалити зі збережених. */
export async function unsaveListing(
  listingId: number,
  accessToken: string,
): Promise<void> {
  await apiRequest<void>(`${BASE}/${listingId}`, {
    method: 'DELETE',
    accessToken,
  })
}

