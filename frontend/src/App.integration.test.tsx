// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from './i18n'
import App from './App'

afterEach(() => {
  vi.unstubAllGlobals()
  sessionStorage.clear()
})

describe('application listing-to-login flow', () => {
  it('shows authentication after save and displays a rejected login response', async () => {
    const listing = {
      id: 42,
      title: 'Quiet apartment',
      description: null,
      pricePerNight: 120,
      maxGuests: 2,
      latitude: 50.45,
      longtitude: 30.52,
      location: 'Kyiv',
      region: 'Kyiv',
      category: 'Apartments',
      images: [],
      amenities: [],
      reviews: [],
      isPublished: true,
      rating: null,
      reviewCount: 0,
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url === '/api/listings/regions') {
        return new Response('[]', { status: 200 })
      }
      if (url.startsWith('/api/listings?')) {
        return new Response(JSON.stringify([listing]), { status: 200 })
      }
      if (url === '/api/auth/login') {
        return new Response(JSON.stringify({ message: 'Invalid email or password' }), { status: 401 })
      }
      return new Response(null, { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      constructor(_callback: ResizeObserverCallback) {}
    })

    render(
      <GoogleOAuthProvider clientId="test-client-id">
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </GoogleOAuthProvider>,
    )

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    fireEvent.click(await screen.findByRole('button', { name: 'Додати до збережених' }))
    expect(await screen.findByRole('dialog', { name: 'Sign In' })).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'guest@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrong-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect((await screen.findByRole('alert')).textContent).toBe('Invalid email or password')
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
    }))
  })
})
