import type { UserInfosResponse } from '@/types/user'

const BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL
const TOKEN = import.meta.env.VITE_API_AUTH_TOKEN

export async function fetchUserInfos(userId: string): Promise<UserInfosResponse> {
  if (!BASE) throw new Error('VITE_SUPABASE_FUNCTIONS_URL non défini')
  if (!TOKEN) throw new Error('VITE_API_AUTH_TOKEN non défini')

  const url = `${BASE}/user-infos?userId=${encodeURIComponent(userId)}`
  const res = await fetch(url, {
    headers: { 'x-auth-token': TOKEN },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}${body ? `: ${body}` : ''}`)
  }
  return (await res.json()) as UserInfosResponse
}
