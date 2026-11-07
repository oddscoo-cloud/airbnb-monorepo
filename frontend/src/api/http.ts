export type ApiRequestOptions = RequestInit & {
  // Дополнительные параметры API-клиента.
  accessToken?: string
  fallbackError?: (status: number) => string
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!response.ok) return null
    const data = (await response.json()) as { access_token?: string }
    if (!data.access_token) return null
    sessionStorage.setItem('access_token', data.access_token)
    return data.access_token
  } catch {
    return null
  }
}

// Общий запрос: заголовки, разбор JSON и обработка HTTP-ошибок.
export async function apiRequest<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const { accessToken, fallbackError, ...requestOptions } = options
  const headers = new Headers(requestOptions.headers)

  // Заголовок авторизации при наличии токена.
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  // Автоматический multipart Content-Type для FormData; ручной заголовок нарушил бы boundary.
  if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response = await fetch(url, { ...requestOptions, headers })
  // Access token живёт 30 минут: при 401 обновляем его по refresh-cookie и повторяем запрос один раз.
  if (response.status === 401 && accessToken) {
    const fresh = await refreshAccessToken()
    if (fresh) {
      headers.set('Authorization', ['Bearer', fresh].join(' '))
      response = await fetch(url, { ...requestOptions, headers })
    }
  }
  let body: unknown = null
  if (response.status !== 204) {
    const responseText = await response.text()
    if (responseText) {
      try {
        body = JSON.parse(responseText) as unknown
      } catch {
        if (response.ok) throw new Error('Invalid JSON response')
      }
    }
  }

  // Приоритет сообщения сервера, затем fallback и стандартный текст ошибки.
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body
      ? body.message
      : null
    const errorMessage = typeof message === 'string'
      ? message
      : fallbackError?.(response.status) ?? `Request failed (${response.status})`
    throw new Error(errorMessage)
  }

  // Приведение к T без runtime-валидации ответа.
  return body as T
}
