import * as Crypto from 'expo-crypto'
import type { SQLiteDatabase } from 'expo-sqlite'

import { Money } from '../../money'
import { findPersonById } from '../people/people-database'
import {
  calculateLoanSummary,
  calculateOutstandingBalance,
  deriveLoanStatus,
  type LoanSummary,
} from './loans-calculations'
import {
  deleteLoanRow,
  findLoanById,
  getLoanPaymentCount,
  getLoanTotalPayments,
  insertLoanRow,
  listLoanRows,
  listLoanRowsByPerson,
  syncLoanStatusInTransaction,
  syncLoanStatusRow,
  updateLoanRow,
} from './loans-database'

export type LoanStatus = 'active' | 'paid'

export interface Loan {
  id: string
  personId: string
  amountInCents: number
  description: string | null
  date: string
  status: LoanStatus
  createdAt: string
  updatedAt: string
}

export interface LoanListItem extends Loan {
  personName?: string
  outstandingBalance: Money
}

export interface CreateLoanInput {
  personId: string
  amountInCents: number
  description?: string | null
  date: string
}

export type CreateLoanResult =
  | { success: true; loan: Loan }
  | { success: false; reason: 'person_not_found' }
  | { success: false; reason: 'invalid_amount' }
  | { success: false; reason: 'invalid_date' }

export interface UpdateLoanInput {
  id: string
  personId?: string
  amountInCents: number
  description?: string | null
  date: string
}

export type UpdateLoanResult =
  | { success: true; loan: Loan }
  | { success: false; reason: 'loan_not_found' }
  | { success: false; reason: 'person_not_found' }
  | { success: false; reason: 'invalid_amount' }
  | { success: false; reason: 'invalid_date' }
  | { success: false; reason: 'amount_change_not_allowed' }

export interface DeleteLoanInput {
  id: string
}

export type DeleteLoanResult =
  | { success: true; loan: Loan }
  | { success: false; reason: 'loan_not_found' }

export {
  calculateLoanSummary,
  calculateOutstandingBalance,
  deriveLoanStatus,
  type LoanSummary,
}

export async function findLoan(
  database: SQLiteDatabase,
  id: string,
): Promise<LoanListItem | null> {
  return findLoanById(database, id)
}

export async function listLoans(
  database: SQLiteDatabase,
  filter?: { personId?: string; status?: LoanStatus },
): Promise<LoanListItem[]> {
  return listLoanRows(database, filter)
}

export async function listLoansByPerson(
  database: SQLiteDatabase,
  personId: string,
): Promise<LoanListItem[]> {
  return listLoanRowsByPerson(database, personId)
}

export async function listActiveLoans(
  database: SQLiteDatabase,
): Promise<LoanListItem[]> {
  return listLoanRows(database, { status: 'active' })
}

export async function listPaidLoans(
  database: SQLiteDatabase,
): Promise<LoanListItem[]> {
  return listLoanRows(database, { status: 'paid' })
}

export async function createLoan(
  database: SQLiteDatabase,
  input: CreateLoanInput,
): Promise<CreateLoanResult> {
  if (!input.personId || !input.personId.trim()) {
    return { success: false, reason: 'person_not_found' }
  }

  const person = await findPersonById(database, input.personId.trim())
  if (!person) {
    return { success: false, reason: 'person_not_found' }
  }

  if (!Number.isInteger(input.amountInCents) || input.amountInCents <= 0) {
    return { success: false, reason: 'invalid_amount' }
  }

  if (typeof input.date !== 'string' || !input.date.trim()) {
    return { success: false, reason: 'invalid_date' }
  }

  const timestamp = new Date().toISOString()
  const loan: Loan = {
    id: Crypto.randomUUID(),
    personId: input.personId.trim(),
    amountInCents: input.amountInCents,
    description: input.description?.trim() || null,
    date: input.date.trim(),
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const success = await insertLoanRow(database, loan)

  if (!success) {
    throw new Error('Failed to create loan')
  }

  return { success: true, loan }
}

export async function updateLoan(
  database: SQLiteDatabase,
  input: UpdateLoanInput,
): Promise<UpdateLoanResult> {
  const existing = await findLoanById(database, input.id)
  if (!existing) {
    return { success: false, reason: 'loan_not_found' }
  }

  const targetPersonId = input.personId?.trim() || existing.personId
  const person = await findPersonById(database, targetPersonId)
  if (!person) {
    return { success: false, reason: 'person_not_found' }
  }

  if (!Number.isInteger(input.amountInCents) || input.amountInCents <= 0) {
    return { success: false, reason: 'invalid_amount' }
  }

  if (typeof input.date !== 'string' || !input.date.trim()) {
    return { success: false, reason: 'invalid_date' }
  }

  const paymentCount = await getLoanPaymentCount(database, input.id)
  if (paymentCount > 0 && input.amountInCents !== existing.amountInCents) {
    return { success: false, reason: 'amount_change_not_allowed' }
  }

  const timestamp = new Date().toISOString()
  const updatedLoan: Loan = {
    id: existing.id,
    personId: targetPersonId,
    amountInCents: input.amountInCents,
    description:
      input.description !== undefined
        ? input.description?.trim() || null
        : existing.description,
    date: input.date.trim(),
    status: existing.status,
    createdAt: existing.createdAt,
    updatedAt: timestamp,
  }

  const success = await updateLoanRow(database, updatedLoan)

  if (!success) {
    throw new Error('Failed to update loan')
  }

  return { success: true, loan: updatedLoan }
}

export async function deleteLoan(
  database: SQLiteDatabase,
  inputOrId: DeleteLoanInput | string,
): Promise<DeleteLoanResult> {
  const id = typeof inputOrId === 'string' ? inputOrId : inputOrId.id

  const loan = await findLoanById(database, id)
  if (!loan) {
    return { success: false, reason: 'loan_not_found' }
  }

  const success = await deleteLoanRow(database, id)

  if (!success) {
    throw new Error('Failed to delete loan')
  }

  return { success: true, loan }
}

export async function getLoanSummary(
  database: SQLiteDatabase,
  loanId: string,
): Promise<LoanSummary | null> {
  const loan = await findLoanById(database, loanId)
  if (!loan) {
    return null
  }

  const totalPaidInCents = await getLoanTotalPayments(database, loanId)
  return calculateLoanSummary(loan.amountInCents, totalPaidInCents)
}

export async function recalculateLoanStatus(
  database: SQLiteDatabase,
  loanId: string,
) {
  return syncLoanStatusRow(database, loanId)
}

export async function recalculateLoanStatusInTransaction(loanId: string) {
  return syncLoanStatusInTransaction(loanId)
}
