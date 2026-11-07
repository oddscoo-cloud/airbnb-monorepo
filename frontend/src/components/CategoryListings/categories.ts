import type { ComponentType } from 'react'
import {
  Mountain,
  Home,
  Building2,
  DoorOpen,
  BedDouble,
  Gem,
  Building,
  Trees,
  Palette,
  Waves,
  Castle,
  Sparkles,
} from 'lucide-react'

interface Category {
  id: string
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>
}

// Категории: id хранится в state, label сопоставляется с категорией объявления.
export const CATEGORIES: Category[] = [
  { id: 'all', label: 'Усі помешкання', icon: Home },
  { id: 'views', label: 'Гарні краєвиди', icon: Mountain },
  { id: 'small-flats', label: 'Невеликі квартири', icon: Home },
  { id: 'big-flats', label: 'Великі квартири', icon: Building2 },
  { id: 'rooms', label: 'Кімнати', icon: DoorOpen },
  { id: 'hostels', label: 'Хостели', icon: BedDouble },
  { id: 'luxe', label: 'Люкс', icon: Gem },
  { id: 'downtown', label: 'У центрі міста', icon: Building },
  { id: 'countryside', label: 'Сільська місцевість', icon: Trees },
  { id: 'designer', label: 'Від дизайнера', icon: Palette },
  { id: 'seaside', label: 'Біля моря', icon: Waves },
  { id: 'mansions', label: 'Особняки', icon: Castle },
  { id: 'legendary', label: 'Легендарне', icon: Sparkles },
  { id: 'apartment', label: 'Квартира', icon: Building2 },
  { id: 'apartments', label: 'Апартаменти', icon: Building },
  { id: 'guest-house', label: 'Гостьовий будинок', icon: Home },
  { id: 'studio', label: 'Студія', icon: Home },
  { id: 'hotel', label: 'Готель', icon: Building },
  { id: 'house', label: 'Будинок', icon: Home },
  { id: 'cottage', label: 'Котедж', icon: Trees },
  { id: 'loft', label: 'Лофт', icon: Palette },
  { id: 'hostel', label: 'Хостел', icon: BedDouble },
  { id: 'villa', label: 'Вілла', icon: Castle },
]
