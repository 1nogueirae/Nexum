import type { SQLiteDatabase } from 'expo-sqlite'

import { TABLE_NAMES, type LoanRow } from '../../database/schema'
import { Money } from '../../money'
import type { Loan, LoanListItem, LoanStatus } from './loans'

type LoanListRow = LoanRow & {
  person_name?: string
  outstanding_balance: number
}

export function mapLoanRow(row: LoanRow): Loan {
  return {
    id: row.id,
    personId: row.person_id,
    amountInCents: row.amount_in_cents,
    description: row.description,
    date: row.date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function findLoanById(
  database: SQLiteDatabase,
  id: string,
): Promise<LoanListItem | null> {
  const row = await database.getFirstAsync<LoanListRow>(
    `SELECT
      l.*,
      p.name AS person_name,
      (l.amount_in_cents - COALESCE(SUM(pay.amount_in_cents), 0))
        AS outstanding_balance
    FROM ${TABLE_NAMES.loans} l
    INNER JOIN ${TABLE_NAMES.people} p
      ON p.id = l.person_id
    LEFT JOIN ${TABLE_NAMES.payments} pay
      ON pay.loan_id = l.id
    WHERE l.id = ?
    GROUP BY l.id, p.name`,
    [id],
  )

  if (!row) {
    return null
  }

  return {
    ...mapLoanRow(row),
    personName: row.person_name,
    outstandingBalance: Money.fromCents(row.outstanding_balance),
  }
}

export async function listLoanRows(
  database: SQLiteDatabase,
  filter?: { personId?: string; status?: LoanStatus },
): Promise<LoanListItem[]> {
  const conditions: string[] = []
  const params: (string | number | null)[] = []

  if (filter?.personId) {
    conditions.push('l.person_id = ?')
    params.push(filter.personId)
  }

  if (filter?.status) {
    conditions.push('l.status = ?')
    params.push(filter.status)
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const rows = await database.getAllAsync<LoanListRow>(
    `SELECT
      l.*,
      p.name AS person_name,
      (l.amount_in_cents - COALESCE(SUM(pay.amount_in_cents), 0))
        AS outstanding_balance
    FROM ${TABLE_NAMES.loans} l
    INNER JOIN ${TABLE_NAMES.people} p
      ON p.id = l.person_id
    LEFT JOIN ${TABLE_NAMES.payments} pay
      ON pay.loan_id = l.id
    ${whereClause}
    GROUP BY l.id, p.name
    ORDER BY l.date DESC, l.created_at DESC`,
    params,
  )

  return rows.map((row) => ({
    ...mapLoanRow(row),
    personName: row.person_name,
    outstandingBalance: Money.fromCents(row.outstanding_balance),
  }))
}

export async function listLoanRowsByPerson(
  database: SQLiteDatabase,
  personId: string,
): Promise<LoanListItem[]> {
  return listLoanRows(database, { personId })
}

export async function insertLoanRow(
  database: SQLiteDatabase,
  loan: Loan,
): Promise<boolean> {
  const result = await database.runAsync(
    `INSERT INTO ${TABLE_NAMES.loans} (
      id, person_id, amount_in_cents, description, date, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      loan.id,
      loan.personId,
      loan.amountInCents,
      loan.description,
      loan.date,
      loan.status,
      loan.createdAt,
      loan.updatedAt,
    ],
  )

  return result.changes > 0
}

export async function updateLoanRow(
  database: SQLiteDatabase,
  loan: Loan,
): Promise<boolean> {
  const result = await database.runAsync(
    `UPDATE ${TABLE_NAMES.loans}
    SET person_id = ?, amount_in_cents = ?, description = ?, date = ?, status = ?, updated_at = ?
    WHERE id = ?`,
    [
      loan.personId,
      loan.amountInCents,
      loan.description,
      loan.date,
      loan.status,
      loan.updatedAt,
      loan.id,
    ],
  )

  return result.changes > 0
}

export async function deleteLoanRow(
  database: SQLiteDatabase,
  id: string,
): Promise<boolean> {
  const result = await database.runAsync(
    `DELETE FROM ${TABLE_NAMES.loans} WHERE id = ?`,
    [id],
  )

  return result.changes > 0
}

export async function getLoanPaymentCount(
  database: SQLiteDatabase,
  loanId: string,
): Promise<number> {
  const row = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM ${TABLE_NAMES.payments} WHERE loan_id = ?`,
    [loanId],
  )

  return row?.count ?? 0
}
