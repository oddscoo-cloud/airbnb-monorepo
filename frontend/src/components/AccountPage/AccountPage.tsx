import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { getCurrentUser, type UserResponse } from '../../api/users'
import { UserMenu, type UserMenuProps } from '../UserMenu/UserMenu'
import './AccountPage.css'

interface AccountPageProps {
  accessToken: string
  menu: UserMenuProps
  onHome?: () => void
  onVerify?: () => void
  onCreateProfile?: () => void
  onHost?: () => void
}

const ROLE_LABELS: Record<string, string> = {
  Guest: 'Гість',
  Admin: 'Адміністратор',
}

export function AccountPage({ accessToken, menu, onHome, onVerify, onCreateProfile, onHost }: AccountPageProps) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getCurrentUser(accessToken, controller.signal)
      .then(setUser)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : 'Не вдалося завантажити акаунт')
        }
      })
    return () => controller.abort()
  }, [accessToken])

  if (!user) {
    return (
      <div className="account">
        <p className="account__identity-text" role="status">
          {error ?? 'Завантаження…'}
        </p>
      </div>
    )
  }

  const name = user.firstName?.trim() || user.email.split('@')[0]

  return (
    <div className="account">
      <header className="account__header">
        <a
          href="/"
          className="account__logo"
          onClick={(event) => {
            event.preventDefault()
            onHome?.()
          }}
        >
          HomeFU
        </a>

        <div className="account__header-actions">
          <a href="#host" className="account__host-link" onClick={(event) => { event.preventDefault(); onHost?.() }}>
            Запропонувати помешкання на HomeFU
          </a>
          <UserMenu {...menu} />
        </div>
      </header>

      <main className="account__content">
        <div className="account__left">
          <section className="account__user-card" aria-label="Користувач">
            <div className="account__avatar" aria-hidden>
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : name.charAt(0)}
            </div>
            <h1 className="account__name">{name}</h1>
            <p className="account__role">{ROLE_LABELS[user.role] ?? user.role}</p>
          </section>

          <section className="account__verified-card">
            <h2 className="account__verified-title">
              Підтверджена інформація про користувача {name}
            </h2>

            <p className="account__email">
              <Check size={16} aria-hidden />
              <span>Електронна адреса</span>
            </p>

            <div className="account__divider" />

            <h3 className="account__identity-title">Верифікація особи</h3>
            {user.isVerified ? (
              <p className="account__email">
                <Check size={16} aria-hidden />
                <span>Верифіковано</span>
              </p>
            ) : (
              <>
                <p className="account__identity-text">
                  Перш ніж бронювати або приймати гостей на{' '}
                  <span className="account__brand">HomeFU</span>, потрібно виконати цей крок.
                </p>

                <button type="button" className="account__verify-button" onClick={onVerify}>
                  Пройти верифікацію
                </button>
              </>
            )}
          </section>
        </div>

        <section className="account__right">
          <h2 className="account__profile-title">Час створити свій профіль</h2>
          <p className="account__profile-text">
            Ваш профіль на <span className="account__brand">HomeFU</span> є важливою
            складовою кожного бронювання. Створіть профіль, щоб інші господарі та гості могли
            більше про вас дізнатися.
          </p>
          <button type="button" className="account__create-button" onClick={onCreateProfile}>
            Створити профіль
          </button>
        </section>
      </main>
    </div>
  )
}
