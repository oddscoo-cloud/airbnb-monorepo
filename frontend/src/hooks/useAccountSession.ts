import { useEffect, useState } from 'react'
import { apiRequest } from '../api/http'

type Account = {
  role: string
}

export function useAccountSession() {
  const [accountRole, setAccountRole] = useState('')
  const [accountInitial, setAccountInitial] = useState(() => {
    const savedEmail = sessionStorage.getItem('account_email')
    return savedEmail?.charAt(0).toUpperCase() ?? ''
  })

  useEffect(() => {
    const accessToken = sessionStorage.getItem('access_token')
    if (!accessToken) {
      setAccountRole('')
      return
    }

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
    const initial = email.trim().charAt(0).toUpperCase()
    sessionStorage.setItem('account_email', email)
    sessionStorage.setItem('account_role', role)
    setAccountInitial(initial)
    setAccountRole(role)
  }

  async function logout() {
    try {
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
      sessionStorage.removeItem('account_email')
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('account_role')
      document.cookie = 'refresh_token=; Max-Age=0; path=/; SameSite=Lax'
      setAccountInitial('')
      setAccountRole('')
    }
  }

  return { accountRole, accountInitial, handleAuthenticated, logout }
}
