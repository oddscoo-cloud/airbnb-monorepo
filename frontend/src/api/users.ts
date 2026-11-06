import { apiRequest } from './http'

export interface ProfileFacts {
  id: number
  education: string | null
  profession: string | null
  address: string | null
  languages: string | null
  birthdayDecade: string | null
  song: string | null
  excitement: string | null
  fact: string | null
  uselessSkills: string | null
  biographyTitle: string | null
  timeAbsorber: string | null
  pets: string | null
  aboutMe: string | null
  favorite: string | null
}

export interface UserResponse {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  createdAt: string
  facts: ProfileFacts | null
  role: string
  isVerified: boolean
}

export interface VerificationInput {
  documentType: string
  country: string
  front: File
  back: File
}

export async function submitVerification(
  accessToken: string,
  input: VerificationInput,
  signal?: AbortSignal,
): Promise<void> {
  const form = new FormData()
  form.append('documentType', input.documentType)
  form.append('country', input.country)
  form.append('front', input.front)
  form.append('back', input.back)
  await apiRequest<{ isVerified: boolean }>('/api/users/me/verification', {
    method: 'POST',
    accessToken,
    signal,
    body: form,
    fallbackError: (status) => `Не вдалося надіслати документи (${status})`,
  })
}

export const AVATAR_STORAGE_KEY = 'account_avatar'
export const AVATAR_EVENT = 'account-avatar-changed'

// Хранит аватар в sessionStorage и уведомляет UserMenu.
export function cacheAvatar(url: string | null) {
  sessionStorage.setItem(AVATAR_STORAGE_KEY, url ?? '')
  window.dispatchEvent(new Event(AVATAR_EVENT))
}

export async function uploadAvatar(accessToken: string, file: File, signal?: AbortSignal): Promise<string> {
  const form = new FormData()
  form.append('avatar', file)
  const result = await apiRequest<{ avatarUrl: string }>('/api/users/me/avatar', {
    method: 'POST',
    accessToken,
    signal,
    body: form,
    fallbackError: (status) => `Не вдалося завантажити фото (${status})`,
  })
  cacheAvatar(result.avatarUrl)
  return result.avatarUrl
}

interface CurrentAccount {
  id: string
}

// id текущего пользователя берётся из access token через /api/auth/me.
export async function getCurrentUser(accessToken: string, signal?: AbortSignal): Promise<UserResponse> {
  const account = await apiRequest<CurrentAccount>('/api/auth/me', { accessToken, signal })
  const user = await apiRequest<UserResponse>(`/api/users/${account.id}`, {
    accessToken,
    signal,
    fallbackError: (status) => `Не вдалося завантажити профіль (${status})`,
  })
  const avatar = user.avatarUrl || null
  if ((sessionStorage.getItem(AVATAR_STORAGE_KEY) || null) !== avatar) cacheAvatar(avatar)
  return user
}

export async function updateProfileFacts(
  accessToken: string,
  facts: Partial<ProfileFacts>,
  signal?: AbortSignal,
): Promise<ProfileFacts> {
  return apiRequest<ProfileFacts>('/api/users/me/facts', {
    method: 'PUT',
    accessToken,
    signal,
    body: JSON.stringify(facts),
    fallbackError: (status) => `Не вдалося зберегти профіль (${status})`,
  })
}
