import { useRef, useState, type ChangeEvent, type ComponentType } from 'react'
import {
  Briefcase,
  Camera,
  CalendarDays,
  Clock,
  DollarSign,
  Globe,
  GraduationCap,
  Heart,
  Home,
  Languages,
  Lightbulb,
  Menu,
  Music,
  PawPrint,
  Plus,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import './ProfilePage.css'

export interface ProfileUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string | null
}

export interface UserProfile {
  user: ProfileUser
  fields: Record<string, string>
  bio: string
  interests: string[]
}

export interface ProfileApiOptions {
  endpoint?: string
  accessToken?: string
}

export async function fetchUserProfile({ endpoint = '/api/profile', accessToken }: ProfileApiOptions = {}): Promise<UserProfile> {
  const response = await fetch(endpoint, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  })

  if (!response.ok) throw new Error(`Failed to load profile (${response.status})`)
  return response.json() as Promise<UserProfile>
}

export async function updateUserProfile(
  profile: UserProfile,
  { endpoint = '/api/profile', accessToken }: ProfileApiOptions = {},
): Promise<UserProfile> {
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(profile),
  })

  if (!response.ok) throw new Error(`Failed to update profile (${response.status})`)
  return response.json() as Promise<UserProfile>
}
export interface ProfilePageProps {
  onHome?: () => void
  onOpenAdmin?: () => void
  onOpenMap?: () => void
}

interface ProfileField {
  id: string
  label: string
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
}

const LEFT_FIELDS: ProfileField[] = [
  { id: 'school', label: 'Навчальний заклад', icon: GraduationCap },
  { id: 'city', label: 'Місце проживання', icon: Home },
  { id: 'decade', label: 'Десятиліття, коли я народився/-лась', icon: CalendarDays },
  { id: 'hobby', label: 'Найбільше захоплення', icon: Heart },
  { id: 'useless', label: 'Найбільш марні навички', icon: Sparkles },
  { id: 'time', label: 'На що я витрачаю багато часу', icon: Clock },
]

const RIGHT_FIELDS: ProfileField[] = [
  { id: 'job', label: 'Моя професія', icon: Briefcase },
  { id: 'languages', label: 'Мови, якими я володію', icon: Languages },
  { id: 'song', label: 'Улюблена пісня в старших класах', icon: Music },
  { id: 'fact', label: 'Цікавий факт про мене', icon: Lightbulb },
  { id: 'bioTitle', label: 'Бажаний заголовок біографії', icon: BookOpen },
  { id: 'pets', label: 'Домашні тварини', icon: PawPrint },
]

const INTEREST_SLOTS = 3

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: ProfileField
  value: string
  onChange: (value: string) => void
}) {
  const Icon = field.icon
  return (
    <label className="profile__field">
      <span className="profile__field-label">
        <Icon size={18} aria-hidden />
        <span>{field.label}</span>
      </span>
      <input
        className="profile__field-input"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export function ProfilePage({ onHome, onOpenAdmin, onOpenMap }: ProfilePageProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [bio, setBio] = useState('')
  const [editingBio, setEditingBio] = useState(false)
  const [interests, setInterests] = useState<string[]>(Array(INTEREST_SLOTS).fill(''))
  const [editingInterest, setEditingInterest] = useState<number | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const accountEmail = sessionStorage.getItem('account_email') ?? ''
  const accountInitial = accountEmail.charAt(0).toUpperCase()
  const accountRole = sessionStorage.getItem('account_role') ?? ''
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleLogout() {
    sessionStorage.removeItem('account_email')
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('account_role')
    window.location.href = '/'
  }
  function setField(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setAvatarUrl(URL.createObjectURL(file))
  }

  function setInterest(index: number, value: string) {
    setInterests((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  return (
    <div className="profile">
      <header className="profile__header">
        <a href="/" className="profile__logo" onClick={(event) => { event.preventDefault(); onHome?.() }}>
          HomeFU
        </a>

        <div className="profile__header-actions">
          <a href="#host" className="profile__host-link">
            Запропонувати помешкання на HomeFU
          </a>
          <div className="profile__account">
            <button
              type="button"
              className="profile__menu"
              aria-label="User menu"
              aria-expanded={isMenuOpen}
              aria-controls="profile-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <Menu size={16} aria-hidden />
              {accountInitial ? (
                <span className="profile__account-avatar" aria-hidden="true">
                  {accountInitial}
                </span>
              ) : (
                <span className="profile__account-avatar profile__account-avatar--empty" aria-hidden="true" />
              )}
            </button>
            {isMenuOpen && (
              <nav className="profile__account-menu" id="profile-menu" aria-label="Profile navigation">
                {accountInitial ? (
                  <>
                    <a href="/profile" onClick={() => setIsMenuOpen(false)}>Головна</a>
                    {accountRole === 'Admin' && (
                      <a href="/admin" onClick={(event) => { event.preventDefault(); setIsMenuOpen(false); onOpenAdmin?.() }}>Адмін-панель</a>
                    )}
                    <a href="/" onClick={handleLogout}>Вийти</a>
                  </>
                ) : (
                  <>
                    <a href="#signin" onClick={() => setIsMenuOpen(false)}>Вхід</a>
                    <a href="#register" onClick={() => setIsMenuOpen(false)}>Реєстрація</a>
                  </>
                )}
              </nav>
            )}
          </div>
        </div>
      </header>

      <main className="profile__content">
        <div className="profile__avatar-col">
          <div className="profile__avatar">
            {avatarUrl ? <img src={avatarUrl} alt="Фото профілю" /> : <span>{accountInitial || "І"}</span>}
          </div>
          <button
            type="button"
            className="profile__avatar-button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={14} aria-hidden />
            Додати
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="profile__file-input"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="profile__main">
          <h1 className="profile__title">Ваш профіль</h1>
          <p className="profile__intro">
            Інформацію, яку ви надаєте, буде використано на{' '}
            <span className="profile__brand">HomeFU, </span>
            щоб інші гості й господарі мали змогу познайомитися з вами.{' '}
            <a href="#more">Докладніше</a>
          </p>

          <div className="profile__fields">
            <div className="profile__fields-col">
              {LEFT_FIELDS.map((field) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  value={values[field.id] ?? ''}
                  onChange={(value) => setField(field.id, value)}
                />
              ))}
            </div>
            <div className="profile__fields-col">
              {RIGHT_FIELDS.map((field) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  value={values[field.id] ?? ''}
                  onChange={(value) => setField(field.id, value)}
                />
              ))}
            </div>
          </div>

          <h2 className="profile__section-title">Інформація про вас</h2>

          <div className="profile__bio">
            {editingBio ? (
              <>
                <textarea
                  className="profile__bio-input"
                  autoFocus
                  rows={3}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Напишить щось веселе й неординарне."
                />
                <button
                  type="button"
                  className="profile__bio-link"
                  onClick={() => setEditingBio(false)}
                >
                  Готово
                </button>
              </>
            ) : (
              <>
                <p className="profile__bio-text">
                  {bio || 'Напишить щось веселе й неординарне.'}
                </p>
                <button
                  type="button"
                  className="profile__bio-link"
                  onClick={() => setEditingBio(true)}
                >
                  {bio ? 'Редагувати вступ' : 'Додати вступ'}
                </button>
              </>
            )}
          </div>

          <div className="profile__divider" />

          <h2 className="profile__subsection-title">Що ви найбільше любите?</h2>
          <p className="profile__interests-text">
            Спілкуйтеся на грунті спільний зацікавлень з іншими гостями та господарями,
            вказавши свої інтереси в профілі.
          </p>

          <div className="profile__interests">
            {interests.map((interest, index) =>
              editingInterest === index ? (
                <input
                  key={index}
                  className="profile__interest profile__interest--input"
                  autoFocus
                  value={interest}
                  maxLength={20}
                  onChange={(event) => setInterest(index, event.target.value)}
                  onBlur={() => setEditingInterest(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') setEditingInterest(null)
                  }}
                />
              ) : (
                <button
                  key={index}
                  type="button"
                  className={`profile__interest${interest ? ' profile__interest--filled' : ''}`}
                  onClick={() => setEditingInterest(index)}
                  aria-label={interest || 'Додати інтерес'}
                >
                  {interest || <Plus size={16} aria-hidden />}
                </button>
              ),
            )}
          </div>
        </div>
      </main>

      <footer className="profile__footer">
        <div className="profile__footer-legal">
          <span>2022 HomeFU, Inc.</span>
          <a href="#privacy">Конфінденційність</a>
          <a href="#terms">Умови</a>
          <a href="#sitemap" onClick={(event) => { if (onOpenMap) { event.preventDefault(); onOpenMap() } }}>Мапа сайту</a>
        </div>

        <div className="profile__footer-locale">
          <button type="button">
            <Globe size={16} aria-hidden />
            <span>Українська (UA)</span>
          </button>
          <button type="button">
            <DollarSign size={16} aria-hidden />
            <span>USD</span>
          </button>
          {/* <a href="#facebook" aria-label="Facebook">
            <Facebook size={16} aria-hidden />
          </a>
          <a href="#instagram" aria-label="Instagram">
            <Instagram size={16} aria-hidden />
          </a>*/}
        </div> 
      </footer>
    </div>
  )
}
