import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { getCurrentUser, type UserResponse } from '../../api/users'
import { getAccountInitial } from '../../utils/account'
import { UserMenu, type UserMenuProps } from '../UserMenu/UserMenu'
import { useAccountAvatar } from '../../hooks/useAccountAvatar'
import { useLanguage } from '../../i18n'
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
  const { t } = useLanguage()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const avatarUrl = useAccountAvatar()

  useEffect(() => {
    const controller = new AbortController()
    void getCurrentUser(accessToken, controller.signal)
      .then(setUser)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : t('Не вдалося завантажити акаунт'))
        }
      })
    return () => controller.abort()
  }, [accessToken, t])

  if (!user) {
    return (
      <div className="account">
        <p className="account__identity-text" role="status">
          {error ?? t('Завантаження…')}
        </p>
      </div>
    )
  }

  const name = user.firstName?.trim() || user.email.split('@')[0]
  const initial = menu.accountInitial || getAccountInitial(user.email)

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
            {t('Запропонувати помешкання на HomeFU')}
          </a>
          <UserMenu {...menu} accountInitial={initial} />
        </div>
      </header>

      <main className="account__content">
        <div className="account__left">
          <section className="account__user-card" aria-label={t('Користувач')}>
            <div className="account__avatar" aria-hidden>
              {avatarUrl ? <img src={avatarUrl} alt="" /> : initial}
            </div>
            <h1 className="account__name">{name}</h1>
            <p className="account__role">{t(ROLE_LABELS[user.role] ?? user.role)}</p>
          </section>

          <section className="account__verified-card">
            <h2 className="account__verified-title">
              {t('Підтверджена інформація про користувача')} {name}
            </h2>

            <p className="account__email">
              <Check size={16} aria-hidden />
              <span>{t('Електронна адреса')}</span>
            </p>

            <div className="account__divider" />

            <h3 className="account__identity-title">{t('Верифікація особи')}</h3>
            {user.isVerified ? (
              <p className="account__email">
                <Check size={16} aria-hidden />
                <span>{t('Верифіковано')}</span>
              </p>
            ) : (
              <>
                <p className="account__identity-text">
                  {t('Перш ніж бронювати або приймати гостей на')}{' '}
                  <span className="account__brand">HomeFU</span>{t(', потрібно виконати цей крок.')}
                </p>

                <button type="button" className="account__verify-button" onClick={onVerify}>
                  {t('Пройти верифікацію')}
                </button>
              </>
            )}
          </section>
        </div>

        <section className="account__right">
          <h2 className="account__profile-title">{t('Час створити свій профіль')}</h2>
          <p className="account__profile-text">
            {t('Ваш профіль на')} <span className="account__brand">HomeFU</span> {t('є важливою складовою кожного бронювання. Створіть профіль, щоб інші господарі та гості могли більше про вас дізнатися.')}
          </p>
          <button type="button" className="account__create-button" onClick={onCreateProfile}>
            {t('Мiй профіль')}
          </button>
        </section>
      </main>
    </div>
  )
}
