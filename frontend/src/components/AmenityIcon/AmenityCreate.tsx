import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AMENITY_ICON_KEYS, AmenityIcon } from './AmenityIcon'
import './AmenityCreate.css'

type Props = {
  onCreate: (name: string, icon: string) => Promise<void>
}

// Мини-форма добавления своего удобства: название + выбор иконки.
export function AmenityCreate({ onCreate }: Props) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('other')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!name.trim()) return
    setBusy(true)
    setError('')
    try {
      await onCreate(name.trim(), icon)
      setName('')
      setIcon('other')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося додати зручність')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="amenity-create">
      <div className="amenity-create__row">
        <input
          type="text"
          value={name}
          maxLength={60}
          placeholder="Нова зручність"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); void submit() }
          }}
        />
        <button type="button" disabled={busy || !name.trim()} onClick={() => void submit()}>
          <Plus size={14} aria-hidden /> Додати
        </button>
      </div>
      <div className="amenity-create__icons" role="radiogroup" aria-label="Іконка">
        {AMENITY_ICON_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={icon === key}
            className={icon === key ? 'is-active' : ''}
            onClick={() => setIcon(key)}
          >
            <AmenityIcon icon={key} size={18} />
          </button>
        ))}
      </div>
      {error && <p className="amenity-create__error">{error}</p>}
    </div>
  )
}
