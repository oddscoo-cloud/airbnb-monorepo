import { apiRequest } from './http'

export interface Region {
  id: number
  name: string
  imageUrl: string
}

export function getRegions(signal?: AbortSignal): Promise<Region[]> {
  return apiRequest<Region[]>('/api/region', {
    signal,
    fallbackError: (status) => `Не вдалося завантажити регіони (${status})`,
  })
}
