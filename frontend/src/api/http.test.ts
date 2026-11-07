// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from './http'

afterEach(() => {
  vi.unstubAllGlobals()
  sessionStorage.clear()
})

describe('apiRequest', () => {
  it('sends JSON requests with the access token and returns parsed data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ saved: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiRequest<{ saved: boolean }>('/api/example', {
      method: 'POST',
      accessToken: 'access-token',
      body: JSON.stringify({ id: 42 }),
    })).resolves.toEqual({ saved: true })

    const request = fetchMock.mock.calls[0]?.[1]
    expect(request).toBeDefined()
    if (!request) throw new Error('Expected the API request to be sent')
    expect(request.method).toBe('POST')
    expect((request.headers as Headers).get('Authorization')).toBe('Bearer access-token')
    expect((request.headers as Headers).get('Content-Type')).toBe('application/json')
  })

  it('surfaces backend errors instead of hiding service failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Database unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    ))

    await expect(apiRequest('/api/example')).rejects.toThrow('Database unavailable')
  })

  it('returns null for a successful 204 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(apiRequest('/api/example')).resolves.toBeNull()
  })

  it('rejects malformed JSON from successful responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('{broken', { status: 200 }),
    ))

    await expect(apiRequest('/api/example')).rejects.toThrow('Invalid JSON response')
  })

  it('refreshes an expired access token once and retries the request', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'fresh-token' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 42 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiRequest<{ id: number }>('/api/private', {
      accessToken: 'expired-token',
    })).resolves.toEqual({ id: 42 })

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(sessionStorage.getItem('access_token')).toBe('fresh-token')
    const retriedRequest = fetchMock.mock.calls[2]?.[1]
    expect(retriedRequest).toBeDefined()
    if (!retriedRequest) throw new Error('Expected the request to be retried')
    expect((retriedRequest.headers as Headers).get('Authorization')).toBe('Bearer fresh-token')
  })
})
