// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getSavedListingIds,
  getSavedListings,
  saveListing,
  unsaveListing,
} from '../api/savedListings'
import { useSavedListings } from './useSavedListings'

vi.mock('../api/savedListings', () => ({
  getSavedListingIds: vi.fn(),
  getSavedListings: vi.fn(),
  saveListing: vi.fn(),
  unsaveListing: vi.fn(),
}))

describe('useSavedListings', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getSavedListingIds).mockResolvedValue([])
    vi.mocked(getSavedListings).mockResolvedValue([])
    vi.mocked(saveListing).mockResolvedValue()
    vi.mocked(unsaveListing).mockResolvedValue()
  })

  it('sends only one save request for rapid repeated toggles', async () => {
    let finishSave!: () => void
    const savePending = new Promise<void>((resolve) => {
      finishSave = resolve
    })
    vi.mocked(saveListing).mockReturnValue(savePending)
    vi.mocked(getSavedListingIds).mockResolvedValueOnce([]).mockResolvedValue([42])

    const { result } = renderHook(() => useSavedListings('access-token'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let firstToggle!: Promise<void>
    let repeatedToggle!: Promise<void>
    act(() => {
      firstToggle = result.current.toggle(42)
      repeatedToggle = result.current.toggle(42)
    })

    expect(result.current.savedIds.has(42)).toBe(true)
    await act(async () => repeatedToggle)
    expect(saveListing).toHaveBeenCalledTimes(1)

    await act(async () => {
      finishSave()
      await firstToggle
    })
    await waitFor(() => expect(result.current.savedIds.has(42)).toBe(true))
  })

  it('rolls back optimistic state and exposes save errors', async () => {
    vi.mocked(saveListing).mockRejectedValue(new Error('Network unavailable'))
    const { result } = renderHook(() => useSavedListings('access-token'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => result.current.toggle(42))

    expect(result.current.savedIds.has(42)).toBe(false)
    expect(result.current.error).toBe('Network unavailable')
  })

  it('clears saved data and loading state when the session ends', async () => {
    const initialProps: { token: string | null } = { token: 'access-token' }
    const { result, rerender } = renderHook(
      ({ token }: { token: string | null }) => useSavedListings(token),
      { initialProps },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    rerender({ token: null })

    expect(result.current.savedIds.size).toBe(0)
    expect(result.current.savedListings).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })
})
