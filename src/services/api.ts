import type { UserInfosResponse } from '@/types/user'

const BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function fetchUserInfos(userId: string, token: string): Promise<UserInfosResponse> {
  if (!BASE) throw new Error('VITE_SUPABASE_FUNCTIONS_URL non défini')
  if (!token) throw new Error("Token d'authentification non défini")

  const url = `${BASE}/user-infos?userId=${encodeURIComponent(userId)}`
  const res = await fetch(url, {
    headers: { 'x-auth-token': token },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, `HTTP ${res.status}${body ? `: ${body}` : ''}`)
  }
  return (await res.json()) as UserInfosResponse
}
