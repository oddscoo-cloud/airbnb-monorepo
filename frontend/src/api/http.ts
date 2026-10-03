export type ApiRequestOptions = RequestInit & {
  // Дополнительные параметры API-клиента.
  accessToken?: string
  fallbackError?: (status: number) => string
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

  const response = await fetch(url, { ...requestOptions, headers })
  // Обработка пустого ответа 204 и невалидного JSON.
  const body: unknown = response.status === 204
    ? null
    : await response.json().catch(() => null)

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
