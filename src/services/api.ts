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

/** Sens d'un ajustement de points côté edge function `decrement-points`. */
export type PointsOperation = 'decrement' | 'increment'

/** Réponse de l'edge function `decrement-points` (ajout ou retrait). */
export interface AdjustPointsResponse {
  status: 'inserted'
  operation: PointsOperation
  invoice: {
    id: string
    external_id: string
    points: number
    amount_eur: number
    user_id: string
    created_at: string
  }
}

/** @deprecated Conservé pour compatibilité ; utiliser `AdjustPointsResponse`. */
export type RedeemPointsResponse = AdjustPointsResponse

/**
 * Appel générique à `decrement-points`. `amount` est toujours un entier positif,
 * le sens est donné par `operation` (`decrement` = retrait, `increment` = crédit
 * sans facture liée).
 */
export async function adjustPoints(
  userId: string,
  token: string,
  key: string,
  amount: number,
  operation: PointsOperation,
): Promise<AdjustPointsResponse> {
  if (!BASE) throw new Error('VITE_SUPABASE_FUNCTIONS_URL non défini')
  if (!token) throw new Error("Token d'authentification non défini")

  const params = new URLSearchParams({ userId, key, amount: String(amount), operation })
  const url = `${BASE}/decrement-points?${params.toString()}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-auth-token': token },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, `HTTP ${res.status}${body ? `: ${body}` : ''}`)
  }
  return (await res.json()) as AdjustPointsResponse
}

/** Retire des points (utilisation d'une récompense). */
export function redeemPoints(
  userId: string,
  token: string,
  key: string,
  amount: number,
): Promise<AdjustPointsResponse> {
  return adjustPoints(userId, token, key, amount, 'decrement')
}

/** Crédite des points sans facture liée (geste commercial, bonus, correction…). */
export function creditPoints(
  userId: string,
  token: string,
  key: string,
  amount: number,
): Promise<AdjustPointsResponse> {
  return adjustPoints(userId, token, key, amount, 'increment')
}
