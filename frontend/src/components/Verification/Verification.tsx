import { useEffect, useState, type ChangeEvent } from 'react'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { submitVerification } from '../../api/users'
import { UserMenu, type UserMenuProps } from '../UserMenu/UserMenu'
import './Verification.css'

type Step = 1 | 2 | 3
type Method = 'upload' | 'webcam'
type IdType = 'driver' | 'passport' | 'id'

const ID_TYPES: { id: IdType; label: string; genitive: string }[] = [
  { id: 'driver', label: 'Посвідчення водія', genitive: 'посвідчення водія' },
  { id: 'passport', label: 'Паспорт', genitive: 'паспорта' },
  { id: 'id', label: 'Посвідчення особи', genitive: 'посвідчення особи' },
]

// Список країн — припущення: у макеті над типами документів є поле без підпису.
const COUNTRIES = ['Україна', 'Польща', 'Молдова', 'Німеччина', 'США']

interface VerificationProps {
  accessToken: string
  menu: UserMenuProps
  onHome?: () => void
  onOpenSaved?: () => void
  onComplete?: () => void
}

function Radio({
  name,
  checked,
  onChange,
  label,
}: {
  name: string
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <span className={`verify__radio${checked ? ' verify__radio--checked' : ''}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} aria-label={label} />
    </span>
  )
}

function UploadTile({
  label,
  capture,
  onChange,
}: {
  label: string
  capture: boolean
  onChange: (file: File | null) => void
}) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setPreview(file ? URL.createObjectURL(file) : null)
    onChange(file)
  }

  return (
    <label className={`verify__tile${preview ? ' verify__tile--filled' : ''}`}>
      {preview ? (
        <img src={preview} alt={label} />
      ) : (
        <>
          <ImagePlus size={28} strokeWidth={1.5} aria-hidden />
          <span className="verify__tile-label">{label}</span>
          <span className="verify__tile-hint">Лише JPEG або PNG</span>
        </>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png"
        // на телефоні відкриє камеру, на комп'ютері — звичайний вибір файлу
        {...(capture ? { capture: 'environment' as const } : {})}
        onChange={handleChange}
      />
    </label>
  )
}

export function Verification({ accessToken, menu, onHome, onOpenSaved, onComplete }: VerificationProps) {
  const [step, setStep] = useState<Step>(1)
  const [method, setMethod] = useState<Method>('upload')
  const [country, setCountry] = useState(COUNTRIES[0])
  const [idType, setIdType] = useState<IdType>('driver')
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const genitive = ID_TYPES.find((item) => item.id === idType)?.genitive ?? ''

  async function handleSubmit() {
    if (!front || !back) return
    setIsSubmitting(true)
    setError(null)
    try {
      await submitVerification(accessToken, { documentType: idType, country, front, back })
      onComplete?.()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не вдалося надіслати документи')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="verify">
      <header className="verify__header">
        <a
          href="/"
          className="verify__logo"
          onClick={(event) => {
            event.preventDefault()
            onHome?.()
          }}
        >
          HomeFU
        </a>
        <nav className="verify__nav" aria-label="Меню користувача">
          <a href="#host">Стати господарем</a>
          <a
            href="#saved"
            onClick={(event) => {
              event.preventDefault()
              onOpenSaved?.()
            }}
          >
            Збережене
          </a>
          <a
            href="/"
            onClick={(event) => {
              event.preventDefault()
              onHome?.()
            }}
          >
            Подорожі
          </a>
          <UserMenu {...menu} />
        </nav>
      </header>

      <main className="verify__body">
        <div className="verify__col">
          {step === 1 && (
            <>
              <h1 className="verify__title">Додайте посвідчення особи державного зразка</h1>
              <p className="verify__text">
                Вам потрібно буде додати посвідчення особи державного зразка. Цей крок
                допоможе переконатися, що це справді ви.
              </p>

              <div className="verify__options">
                <label className="verify__option verify__option--first">
                  <div>
                    <h2>Завантажити наявну фотографію</h2>
                    <p>Рекомендовано</p>
                  </div>
                  <Radio
                    name="method"
                    label="Завантажити наявну фотографію"
                    checked={method === 'upload'}
                    onChange={() => setMethod('upload')}
                  />
                </label>

                <label className="verify__option verify__option--second">
                  <h2>Зробіть фотографію за допомогою вебкамери</h2>
                  <Radio
                    name="method"
                    label="Зробіть фотографію за допомогою вебкамери"
                    checked={method === 'webcam'}
                    onChange={() => setMethod('webcam')}
                  />
                </label>
              </div>

              <div className="verify__actions verify__actions--end">
                <button type="button" className="verify__primary" onClick={() => setStep(2)}>
                  Продовжити
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="verify__title">Виберіть відповідний тип посвідчення особи</h1>

              <select
                className="verify__select"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                aria-label="Країна, яка видала документ"
              >
                {COUNTRIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <div className="verify__types">
                {ID_TYPES.map((item) => (
                  <label key={item.id} className="verify__type">
                    <span>{item.label}</span>
                    <Radio
                      name="idType"
                      label={item.label}
                      checked={idType === item.id}
                      onChange={() => setIdType(item.id)}
                    />
                  </label>
                ))}
              </div>

              <p className="verify__note">
                Ваше посвідчення особи оброблятиметься відповідно до нашої{' '}
                <a href="#privacy">
                  Політики конфіденційності та не надаватиметься господарю або гостям.
                </a>
              </p>

              <div className="verify__actions">
                <button type="button" className="verify__back" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} aria-hidden /> Назад
                </button>
                <button type="button" className="verify__primary" onClick={() => setStep(3)}>
                  Продовжити
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="verify__title">Завантажте зображення свого {genitive}</h1>
              <p className="verify__text">
                Фотографії не мають бути розмиті, а на лицевому боці {genitive} має бути чітко
                видно ваше обличчя.
              </p>

              <div className="verify__tiles">
                <UploadTile
                  label="Завантажте лицевий бік"
                  capture={method === 'webcam'}
                  onChange={setFront}
                />
                <UploadTile
                  label="Завантажте зворотній бік"
                  capture={method === 'webcam'}
                  onChange={setBack}
                />
              </div>

              {error && (
                <p className="verify__note" role="alert">
                  {error}
                </p>
              )}

              <div className="verify__actions verify__actions--tiles">
                <button type="button" className="verify__back" onClick={() => setStep(2)}>
                  <ArrowLeft size={14} aria-hidden /> Назад
                </button>
                <button
                  type="button"
                  className="verify__primary"
                  disabled={!front || !back || isSubmitting}
                  onClick={() => void handleSubmit()}
                >
                  Продовжити
                </button>
              </div>
            </>
          )}
        </div>

        {step === 1 && (
          <aside className="verify__privacy">
            <h2>Ваша приватність</h2>
            <p>
              Ми докладаємо максимум зусиль для гарантії конфіденційності, безпеки й захисту
              даних, якими ви ділитеся під час цієї процедури. Докладніше про це читайте в нашій{' '}
              <a href="#privacy">Політиці конфіденційності.</a>
            </p>
            <a href="#how" className="verify__privacy-link">
              Як здійснюється верифікація особи
            </a>
          </aside>
        )}
      </main>
    </div>
  )
}
