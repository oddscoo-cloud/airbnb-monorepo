import { apiRequest } from './http'

export interface Region {
  id: number
  name: string
  imageUrl: string
}

export function getAllRegions(accessToken: string, signal?: AbortSignal): Promise<Region[]> {
  return apiRequest<Region[]>('/api/region/all', { accessToken, signal })
}

export function getRegions(signal?: AbortSignal): Promise<Region[]> {
  return apiRequest<Region[]>('/api/region', {
    signal,
    fallbackError: (status) => `Не вдалося завантажити регіони (${status})`,
  })
}
