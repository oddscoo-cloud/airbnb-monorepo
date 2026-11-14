// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useAccountAvatar } from './useAccountAvatar'
import { useAccountSession } from './useAccountSession'

afterEach(() => {
  sessionStorage.clear()
})

describe('account avatar on logout', () => {
  it('clears the cached image and updates mounted avatars', async () => {
    sessionStorage.setItem('account_email', 'test@example.com')
    sessionStorage.setItem('account_avatar', '/avatar.png')
    const { result } = renderHook(() => ({
      session: useAccountSession(),
      avatar: useAccountAvatar(),
    }))

    expect(result.current.avatar).toBe('/avatar.png')
    await act(async () => { await result.current.session.logout() })
    expect(result.current.avatar).toBeNull()
    expect(sessionStorage.getItem('account_avatar')).toBeNull()
  })
})
