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

interface CurrentAccount {
  id: string
}

// id текущего пользователя берётся из access token через /api/auth/me.
export async function getCurrentUser(accessToken: string, signal?: AbortSignal): Promise<UserResponse> {
  const account = await apiRequest<CurrentAccount>('/api/auth/me', { accessToken, signal })
  return apiRequest<UserResponse>(`/api/users/${account.id}`, {
    accessToken,
    signal,
    fallbackError: (status) => `Не вдалося завантажити профіль (${status})`,
  })
}
