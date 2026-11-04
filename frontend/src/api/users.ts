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
