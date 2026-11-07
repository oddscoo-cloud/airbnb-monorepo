import { useEffect, useRef, useState } from 'react'
import { Menu, User as UserIcon } from 'lucide-react'
import { AVATAR_STORAGE_KEY, getCurrentUser } from '../../api/users'
import { useAccountAvatar } from '../../hooks/useAccountAvatar'
import './UserMenu.css'

export interface UserMenuProps {
  accountInitial?: string
  accountRole?: string
  savedCount?: number
  onOpenProfile?: () => void
  onOpenSaved?: () => void
  onOpenAccount?: () => void
  onOpenAdmin?: () => void
  onSignIn?: () => void
  onRegister?: () => void
  onLogout?: () => void
  className?: string
}

export function UserMenu({
  accountInitial: propInitial,
  accountRole: propRole,
  savedCount,
  onOpenProfile,
  onOpenSaved,
  onOpenAccount,
  onOpenAdmin,
  onSignIn,
  onRegister,
  onLogout,
  className = '',
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Якщо пропси не передані напряму, читаємо із sessionStorage
  const sessionEmail = typeof window !== 'undefined' ? sessionStorage.getItem('account_email') : null
  const sessionRole = typeof window !== 'undefined' ? sessionStorage.getItem('account_role') : null

  const initial = propInitial !== undefined ? propInitial : (sessionEmail?.trim().charAt(0).toUpperCase() ?? '')
  const role = propRole !== undefined ? propRole : (sessionRole ?? '')
  const isAuthenticated = Boolean(initial)
  const avatarUrl = useAccountAvatar()

  // Аватар ещё не загружен в эту сессию — запрашиваем один раз.
  useEffect(() => {
    const token = sessionStorage.getItem('access_token')
    if (!isAuthenticated || !token || sessionStorage.getItem(AVATAR_STORAGE_KEY) !== null) return
    const controller = new AbortController()
    getCurrentUser(token, controller.signal).catch((error: unknown) => {
      if (!controller.signal.aborted) console.error('Failed to load account avatar', error)
    })
    return () => controller.abort()
  }, [isAuthenticated])

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleAction(callback?: () => void) {
    setIsOpen(false)
    callback?.()
  }

  return (
    <div ref={menuRef} className={`user-menu ${className}`}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-label="Меню користувача"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Menu size={16} aria-hidden="true" className="user-menu__icon" />
        {isAuthenticated ? (
          <span className="user-menu__avatar" aria-hidden="true">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : initial}
          </span>
        ) : (
          <span className="user-menu__avatar user-menu__avatar--empty" aria-hidden="true">
            <UserIcon size={16} />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="user-menu__dropdown" role="menu">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={() => handleAction(onOpenProfile)}
              >
                <span>Профіль</span>
              </button>

              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={() => handleAction(onOpenSaved ?? onOpenProfile)}
              >
                <span>Збереженi</span>
                {typeof savedCount === 'number' && savedCount > 0 && (
                  <span className="user-menu__badge">{savedCount}</span>
                )}
              </button>

              {onOpenAccount && (
                <button
                  type="button"
                  className="user-menu__item"
                  role="menuitem"
                  onClick={() => handleAction(onOpenAccount)}
                >
                  <span>Акаунт</span>
                </button>
              )}

              {role === 'Admin' && (
                <button
                  type="button"
                  className="user-menu__item"
                  role="menuitem"
                  onClick={() => handleAction(onOpenAdmin)}
                >
                  <span>Адмін-панель</span>
                </button>
              )}

              <div className="user-menu__divider" />

              <button
                type="button"
                className="user-menu__item user-menu__item--danger"
                role="menuitem"
                onClick={() => handleAction(onLogout)}
              >
                <span>Вийти</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={() => handleAction(onSignIn)}
              >
                <span>Вхід</span>
              </button>
              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={() => handleAction(onRegister)}
              >
                <span>Реєстрація</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
