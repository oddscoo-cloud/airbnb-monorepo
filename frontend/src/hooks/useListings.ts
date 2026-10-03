import { useEffect, useState } from 'react'
import { getListings } from '../api/listings'
import type { Listing } from '../types/listing'

type ListingsState = {
  listings: Listing[]
  isLoading: boolean
  error: string
}

// Загрузка каталога и состояние запроса для React-компонента.
export function useListings(revision: number): ListingsState {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Защита от обновления state после отмены эффекта.
    let isCurrent = true

    async function loadListings() {
      try {
        const data = await getListings()
        if (isCurrent) setListings(data)
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : 'Не вдалося завантажити помешкання')
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    // Асинхронная загрузка из эффекта без блокировки рендера.
    void loadListings()
    return () => { isCurrent = false }
  }, [revision])

  return { listings, isLoading, error }
}
