import { useEffect, useState } from 'react'
import { AVATAR_EVENT, AVATAR_STORAGE_KEY } from '../api/users'

export function useAccountAvatar() {
  const [avatarUrl, setAvatarUrl] = useState(() => sessionStorage.getItem(AVATAR_STORAGE_KEY) || null)

  useEffect(() => {
    const sync = () => setAvatarUrl(sessionStorage.getItem(AVATAR_STORAGE_KEY) || null)
    window.addEventListener(AVATAR_EVENT, sync)
    sync()
    return () => window.removeEventListener(AVATAR_EVENT, sync)
  }, [])

  return avatarUrl
}
