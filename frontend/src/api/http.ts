export type ApiRequestOptions = RequestInit & {
  accessToken?: string
  fallbackError?: (status: number) => string
}

export async function apiRequest<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const { accessToken, fallbackError, ...requestOptions } = options
  const headers = new Headers(requestOptions.headers)

  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, { ...requestOptions, headers })
  const body: unknown = response.status === 204
    ? null
    : await response.json().catch(() => null)

  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body
      ? body.message
      : null
    const errorMessage = typeof message === 'string'
      ? message
      : fallbackError?.(response.status) ?? `Request failed (${response.status})`
    throw new Error(errorMessage)
  }

  return body as T
}
