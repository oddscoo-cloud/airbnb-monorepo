import { useEffect, useRef, useState, type ChangeEvent, type ComponentType } from 'react'
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
  Music,
  PawPrint,
  Plus,
  Sparkles,
  BookOpen,
  Star,
} from 'lucide-react'
import { useSavedListings } from '../../hooks/useSavedListings'
import { getCurrentUser, updateProfileFacts, uploadAvatar, type ProfileFacts } from '../../api/users'
import { UserMenu } from '../UserMenu/UserMenu'
import type { Listing } from '../../types/listing'
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
  onHost?: () => void
  onOpenMap?: () => void
  onOpenListing?: (listing: Listing) => void
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

// Соответствие id полей формы полям ProfileFacts из backend.
const FACT_FIELD_KEYS: Record<string, keyof ProfileFacts> = {
  school: 'education',
  city: 'address',
  decade: 'birthdayDecade',
  hobby: 'excitement',
  useless: 'uselessSkills',
  time: 'timeAbsorber',
  job: 'profession',
  languages: 'languages',
  song: 'song',
  fact: 'fact',
  bioTitle: 'biographyTitle',
  pets: 'pets',
}

function factsToFieldValues(facts: ProfileFacts): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [fieldId, factKey] of Object.entries(FACT_FIELD_KEYS)) {
    const value = facts[factKey]
    if (typeof value === 'string') result[fieldId] = value
  }
  return result
}

// Поле favorite хранит интересы одной строкой через запятую.
function favoriteToInterests(favorite: string | null): string[] {
  const items = (favorite ?? '').split(',').map((item) => item.trim()).filter(Boolean)
  return Array.from({ length: INTEREST_SLOTS }, (_, index) => items[index] ?? '')
}

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

export function ProfilePage({ onHome, onOpenAdmin, onHost, onOpenMap, onOpenListing }: ProfilePageProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [bio, setBio] = useState('')
  const [editingBio, setEditingBio] = useState(false)
  const [interests, setInterests] = useState<string[]>(Array(INTEREST_SLOTS).fill(''))
  const [editingInterest, setEditingInterest] = useState<number | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const accountEmail = sessionStorage.getItem('account_email') ?? ''
  const accountInitial = accountEmail.charAt(0).toUpperCase()
  const accountRole = sessionStorage.getItem('account_role') ?? ''
  const accessToken = sessionStorage.getItem('access_token')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { savedListings, savedIds, isLoading: savedLoading, error: savedError, toggle } = useSavedListings(accessToken)

  useEffect(() => {
    if (!accessToken) return
    const controller = new AbortController()
    void getCurrentUser(accessToken, controller.signal)
      .then((user) => {
        if (user.avatarUrl) setAvatarUrl(user.avatarUrl)
        if (!user.facts) return
        setValues(factsToFieldValues(user.facts))
        setBio(user.facts.aboutMe ?? '')
        setInterests(favoriteToInterests(user.facts.favorite))
      })
      .catch((error) => {
        if (!controller.signal.aborted) console.error('Failed to load user profile', error)
      })
    return () => controller.abort()
  }, [accessToken])

  function handleLogout() {
    sessionStorage.removeItem('account_email')
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('account_role')
    sessionStorage.removeItem('account_avatar')
    window.location.href = '/'
  }
  function setField(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !accessToken) return
    setAvatarError(null)
    uploadAvatar(accessToken, file)
      .then(setAvatarUrl)
      .catch((error: unknown) => {
        setAvatarError(error instanceof Error ? error.message : 'Не вдалося завантажити фото')
      })
  }

  function setInterest(index: number, value: string) {
    setInterests((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  async function handleSaveProfile() {
    if (!accessToken) return
    
    setIsSaving(true)
    setSaveMessage(null)
    
    try {
      const favoriteText = interests.filter(Boolean).join(', ')
      
      const profileData: Partial<ProfileFacts> = {
        education: values.school || null,
        profession: values.job || null,
        address: values.city || null,
        languages: values.languages || null,
        birthdayDecade: values.decade || null,
        song: values.song || null,
        excitement: values.hobby || null,
        fact: values.fact || null,
        uselessSkills: values.useless || null,
        biographyTitle: values.bioTitle || null,
        timeAbsorber: values.time || null,
        pets: values.pets || null,
        aboutMe: bio || null,
        favorite: favoriteText || null,
      }
      
      await updateProfileFacts(accessToken, profileData)
      setSaveMessage({ type: 'success', text: 'Профіль збережено успішно!' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Помилка при збереженні'
      setSaveMessage({ type: 'error', text: message })
      console.error('Failed to save profile', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="profile">
      <header className="profile__header">
        <a href="/" className="profile__logo" onClick={(event) => { event.preventDefault(); onHome?.() }}>
          HomeFU
        </a>

        <div className="profile__header-actions">
          <a href="#host" className="profile__host-link" onClick={(event) => { event.preventDefault(); onHost?.() }}>
            Запропонувати помешкання на HomeFU
          </a>
          <div className="profile__account">
            <UserMenu
              accountInitial={accountInitial}
              accountRole={accountRole}
              savedCount={savedIds.size}
              onOpenProfile={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              onOpenSaved={() => {
                setShowSaved(true)
                setTimeout(() => {
                  const el = document.querySelector('.profile__saved-header')
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 50)
              }}
              onOpenAdmin={onOpenAdmin}
              onLogout={handleLogout}
            />
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
          {avatarError && <p role="alert">{avatarError}</p>}
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

          <div className="profile__divider" />

          <div className="profile__save-section">
            {saveMessage && (
              <p
                className={`profile__save-message profile__save-message--${saveMessage.type}`}
                role={saveMessage.type === 'error' ? 'alert' : undefined}
              >
                {saveMessage.text}
              </p>
            )}
            <button
              type="button"
              className="profile__save-button"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? 'Збереження...' : 'Зберегти профіль'}
            </button>
          </div>

          <div className="profile__divider" />

          <div className="profile__saved-header">
            <h2 className="profile__section-title profile__section-title--no-margin">
              <Heart size={20} aria-hidden />
              Збереженi
            </h2>
            <button
              type="button"
              className="profile__saved-toggle"
              aria-expanded={showSaved}
              onClick={() => setShowSaved((s) => !s)}
            >
              {showSaved ? 'Сховати' : `Показати${savedIds.size > 0 ? ` (${savedIds.size})` : ''}`}
            </button>
          </div>

          {showSaved && (
            <section className="profile__saved" aria-label="Збережені оголошення">
              {savedLoading ? (
                <p className="profile__saved-empty">Завантаження…</p>
              ) : savedError ? (
                <p className="profile__saved-empty" role="alert">{savedError}</p>
              ) : savedListings.length === 0 ? (
                <p className="profile__saved-empty">
                  Ви ще не зберегли жодного помешкання.{' '}
                  Натисніть ❤️ на картці, щоб додати сюди.
                </p>
              ) : (
                <div className="profile__saved-grid">
                  {savedListings.map((listing) => (
                    <article
                      key={listing.id}
                      className="profile__saved-card"
                      onClick={() => onOpenListing?.(listing)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onOpenListing?.(listing)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Відкрити ${listing.title}`}
                    >
                      <div className="profile__saved-card-img">
                        {listing.image
                          ? <img src={listing.image} alt={listing.title} loading="lazy" />
                          : <span className="profile__saved-card-placeholder" />
                        }
                        <button
                          type="button"
                          className="profile__saved-card-unsave"
                          aria-label="Видалити зі збережених"
                          onClick={(e) => {
                            e.stopPropagation()
                            void toggle(Number(listing.id))
                          }}
                        >
                          <Heart size={16} fill="currentColor" aria-hidden />
                        </button>
                      </div>
                      <div className="profile__saved-card-body">
                        <span className="profile__saved-card-location">{listing.location}</span>
                        {listing.rating !== null && (
                          <span className="profile__saved-card-rating">
                            <Star size={12} fill="currentColor" aria-hidden />
                            {listing.rating.toFixed(2)}
                          </span>
                        )}
                        <p className="profile__saved-card-price">
                          <strong>${listing.price},00</strong> за ніч
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
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
