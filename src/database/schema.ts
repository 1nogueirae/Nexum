export const DATABASE_NAME = 'nexum.db'

export const SCHEMA_VERSION = 1

export const TABLE_NAMES = {
  loans: 'loans',
  payments: 'payments',
  people: 'people',
} as const

export interface PersonRow {
  id: string
  name: string
  phone: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface LoanRow {
  id: string
  person_id: string
  amount_in_cents: number
  description: string | null
  date: string
  status: 'active' | 'paid'
  created_at: string
  updated_at: string
}

export interface PaymentRow {
  id: string
  loan_id: string
  amount_in_cents: number
  date: string
  note: string | null
  created_at: string
}
