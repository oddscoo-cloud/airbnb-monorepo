import { useEffect, useState } from 'react'
import { getListings, type ListingSearchFilters } from '../api/listings'
import type { Listing } from '../types/listing'

type ListingsState = {
  listings: Listing[]
  isLoading: boolean
  error: string
}

// Загрузка каталога и состояние запроса для React-компонента.
export function useListings(filters: ListingSearchFilters, revision: number): ListingsState {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    let isCurrent = true
    const controller = new AbortController()
    const searchFilters = JSON.parse(filtersKey) as ListingSearchFilters
    setIsLoading(true)
    setError('')

    async function loadListings() {
      try {
        const data = await getListings(searchFilters, controller.signal)
        if (isCurrent) setListings(data)
      } catch (loadError) {
        if (isCurrent && !controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Не вдалося завантажити помешкання')
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    const timeoutId = window.setTimeout(() => void loadListings(), 250)
    return () => {
      isCurrent = false
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [filtersKey, revision])

  return { listings, isLoading, error }
}
