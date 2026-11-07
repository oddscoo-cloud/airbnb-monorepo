import { useEffect, useState } from 'react'
import { apiRequest } from '../api/http'
import { getAccountInitial } from '../utils/account'

type Account = {
  role: string
}

// Восстановление роли, обновление UI после входа и завершение сессии.
export function useAccountSession() {
  const [accountRole, setAccountRole] = useState('')
  const [accountInitial, setAccountInitial] = useState(() => {
    const savedEmail = sessionStorage.getItem('account_email')
    return getAccountInitial(savedEmail)
  })

  useEffect(() => {
    // Проверка текущего пользователя только при наличии access token.
    const accessToken = sessionStorage.getItem('access_token')
    if (!accessToken) {
      setAccountRole('')
      return
    }

    // Защита от обновления state после размонтирования компонента.
    let isCurrent = true
    void apiRequest<Account>('/api/auth/me', {
      accessToken,
      fallbackError: () => 'Сесія завершилася',
    })
      .then((account) => {
        if (isCurrent) setAccountRole(account.role)
      })
      .catch(() => {
        if (isCurrent) setAccountRole('')
      })

    return () => { isCurrent = false }
  }, [])

  function handleAuthenticated(email: string, role: string) {
    // Синхронизация sessionStorage и React state после успешного входа.
    const initial = getAccountInitial(email)
    sessionStorage.setItem('account_email', email)
    sessionStorage.setItem('account_role', role)
    setAccountInitial(initial)
    setAccountRole(role)
  }

  async function logout() {
    try {
      // Поиск refresh token в доступной JavaScript cookie перед отзывом на backend.
      const refreshToken = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('refresh_token='))
        ?.split('=')[1]

      if (refreshToken) {
        await apiRequest<void>('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
      }
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      // Очистка локальной сессии независимо от результата сетевого запроса.
      sessionStorage.removeItem('account_email')
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('account_role')
      sessionStorage.removeItem('account_avatar')
      document.cookie = 'refresh_token=; Max-Age=0; path=/; SameSite=Lax'
      setAccountInitial('')
      setAccountRole('')
    }
  }

  return { accountRole, accountInitial, handleAuthenticated, logout }
}
