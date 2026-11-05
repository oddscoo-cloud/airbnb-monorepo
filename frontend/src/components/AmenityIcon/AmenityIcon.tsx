import {
  AirVent,
  Bath,
  Briefcase,
  Car,
  Check,
  CookingPot,
  Droplets,
  Dumbbell,
  Flame,
  MoveVertical,
  PawPrint,
  Refrigerator,
  ShieldCheck,
  Shirt,
  Sun,
  Tv,
  Wifi,
  Wind,
  WashingMachine,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Ключи должны совпадать с AmenityCreator.AllowedIcons на бэкенде.
const ICONS: Record<string, LucideIcon> = {
  elevator: MoveVertical,
  washer: WashingMachine,
  'air-conditioner': AirVent,
  kitchen: CookingPot,
  'hair-dryer': Wind,
  parking: Car,
  wifi: Wifi,
  tv: Tv,
  heating: Flame,
  fridge: Refrigerator,
  workspace: Briefcase,
  pets: PawPrint,
  pool: Droplets,
  gym: Dumbbell,
  balcony: Sun,
  security: ShieldCheck,
  bath: Bath,
  iron: Shirt,
  other: Check,
}

export const AMENITY_ICON_KEYS = Object.keys(ICONS)

export function AmenityIcon({ icon, size = 24 }: { icon: string; size?: number }) {
  const Icon = ICONS[icon] ?? Check
  return <Icon size={size} strokeWidth={1.5} aria-hidden />
}
