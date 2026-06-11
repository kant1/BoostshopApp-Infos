export interface Invoice {
  id: string
  user_id: string
  amount_eur: number
  points: number
  created_at: string
  url: string
  external_id: string
}

export interface UserMetadata {
  avatar_url?: string
  email?: string
  email_verified?: boolean
  full_name?: string
  name?: string
  phone_verified?: boolean
  picture?: string
  iss?: string
  provider_id?: string
  sub?: string
}

export interface AppMetadata {
  company_id?: string
  last_invoice_sync_at?: string
  provider?: string
  providers?: string[]
}

export interface UserCore {
  id: string
  email: string
  phone: string
  created_at: string
  last_sign_in_at: string | null
  user_metadata: UserMetadata
  app_metadata: AppMetadata
}

export interface UserInfosResponse {
  user: UserCore
  points_balance: number
  advantages: unknown[] | null
  invoices: Invoice[]
}
