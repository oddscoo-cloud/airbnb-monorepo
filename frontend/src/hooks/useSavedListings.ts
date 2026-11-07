import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getSavedListingIds,
  getSavedListings,
  saveListing,
  unsaveListing,
} from '../api/savedListings'
import type { Listing } from '../types/listing'

type SavedState = {
  savedIds: Set<number>
  savedListings: Listing[]
  isLoading: boolean
  error: string
  toggle: (listingId: number) => Promise<void>
  reload: () => void
}

/**
 * Управляє збереженими оголошеннями для авторизованого користувача.
 * accessToken — jwt із sessionStorage; якщо не передано, повертає порожній стан.
 */
export function useSavedListings(accessToken: string | null): SavedState {
  const [savedIds, setSavedIds]           = useState<Set<number>>(new Set())
  const [savedListings, setSavedListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading]         = useState(false)
  const [error, setError]                 = useState('')
  const [revision, setRevision]           = useState(0)

  const reload = useCallback(() => setRevision((r) => r + 1), [])
  const pendingToggles = useRef(new Set<number>())
  const loadedToken = useRef(accessToken)

  // Зберігаємо ref на актуальний токен, щоб toggle завжди мав свіжий.
  const tokenRef = useRef(accessToken)
  tokenRef.current = accessToken

  useEffect(() => {
    if (!accessToken) {
      loadedToken.current = null
      setSavedIds(new Set())
      setSavedListings([])
      setIsLoading(false)
      setError('')
      return
    }

    let active = true
    const controller = new AbortController()
    if (loadedToken.current !== accessToken) {
      loadedToken.current = accessToken
      setSavedIds(new Set())
      setSavedListings([])
    }
    setIsLoading(true)
    setError('')

    async function load() {
      try {
        // Паралельно завантажуємо ids та повні об'єкти.
        const [ids, listings] = await Promise.all([
          getSavedListingIds(accessToken!, controller.signal),
          getSavedListings(accessToken!, controller.signal),
        ])
        if (active) {
          setSavedIds(new Set(ids))
          setSavedListings(listings)
        }
      } catch (err) {
        if (active && !controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Помилка завантаження збережених')
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()
    return () => {
      active = false
      controller.abort()
    }
  }, [accessToken, revision])

  /** Оптимістичний toggle: одразу оновлює стан, відправляє запит у фоні. */
  const toggle = useCallback(async (listingId: number) => {
    const token = tokenRef.current
    if (!token || pendingToggles.current.has(listingId)) return

    pendingToggles.current.add(listingId)
    const isSaved = savedIds.has(listingId)
    setError('')

    // Оптимістичне оновлення.
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (isSaved) next.delete(listingId)
      else next.add(listingId)
      return next
    })

    try {
      if (isSaved) {
        await unsaveListing(listingId, token)
        setSavedListings((prev) => prev.filter((l) => Number(l.id) !== listingId))
      } else {
        await saveListing(listingId, token)
        // Перезавантажуємо після збереження, щоб отримати повний об'єкт.
        reload()
      }
    } catch (err) {
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (isSaved) next.add(listingId)
        else next.delete(listingId)
        return next
      })
      setError(err instanceof Error ? err.message : 'Помилка оновлення збережених')
    } finally {
      pendingToggles.current.delete(listingId)
    }
  }, [savedIds, reload])

  return { savedIds, savedListings, isLoading, error, toggle, reload }
}
