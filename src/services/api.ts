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

/** Identification de l'utilisateur cible : par UUID (QR code) ou par e-mail. */
export type UserLookup = { userId: string } | { email: string }

export async function fetchUserInfos(lookup: UserLookup, token: string): Promise<UserInfosResponse> {
  if (!BASE) throw new Error('VITE_SUPABASE_FUNCTIONS_URL non défini')
  if (!token) throw new Error("Token d'authentification non défini")

  const params = new URLSearchParams(
    'userId' in lookup ? { userId: lookup.userId } : { email: lookup.email },
  )
  const url = `${BASE}/user-infos?${params.toString()}`
  const res = await fetch(url, {
    headers: { 'x-auth-token': token },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, `HTTP ${res.status}${body ? `: ${body}` : ''}`)
  }
  return (await res.json()) as UserInfosResponse
}

export interface RedeemPointsResponse {
  points_balance: number
}

export async function redeemPoints(
  userId: string,
  token: string,
  key: string,
  amount?: number,
): Promise<RedeemPointsResponse> {
  if (!BASE) throw new Error('VITE_SUPABASE_FUNCTIONS_URL non défini')
  if (!token) throw new Error("Token d'authentification non défini")

  const params = new URLSearchParams({ userId, key })
  if (amount !== undefined) params.set('amount', String(amount))
  const url = `${BASE}/decrement-points?${params.toString()}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-auth-token': token },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, `HTTP ${res.status}${body ? `: ${body}` : ''}`)
  }
  return (await res.json()) as RedeemPointsResponse
}
