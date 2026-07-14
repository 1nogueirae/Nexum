import type { SQLiteDatabase } from 'expo-sqlite'

import { Money } from '../../money'
import { TABLE_NAMES, type PersonRow } from '../../database/schema'
import type { Person, PersonDeletionImpact } from './people'

function mapPersonRow(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listPersonRows(database: SQLiteDatabase) {
  const rows = await database.getAllAsync<PersonRow>(
    `SELECT * FROM ${TABLE_NAMES.people} ORDER BY name COLLATE NOCASE`,
  )

  return rows.map(mapPersonRow)
}

export async function findPersonById(
  database: SQLiteDatabase,
  id: string,
) {
  const row = await database.getFirstAsync<PersonRow>(
    `SELECT * FROM ${TABLE_NAMES.people} WHERE id = ?`,
    [id],
  )

  return row ? mapPersonRow(row) : null
}

export async function insertPersonRow(
  database: SQLiteDatabase,
  person: Person,
) {
  const result = await database.runAsync(
    `INSERT INTO ${TABLE_NAMES.people} (id, name, phone, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      person.id,
      person.name,
      person.phone,
      person.note,
      person.createdAt,
      person.updatedAt,
    ],
  )

  return result.changes > 0
}

export async function updatePersonRow(
  database: SQLiteDatabase,
  person: Person,
) {
  const result = await database.runAsync(
    `UPDATE ${TABLE_NAMES.people} SET name = ?, phone = ?, note = ?, updated_at = ? WHERE id = ?`,
    [
      person.name,
      person.phone,
      person.note,
      person.updatedAt,
      person.id,
    ],
  )

  return result.changes > 0
}

export async function deletePersonRow(
  database: SQLiteDatabase,
  id: string,
) {
  const result = await database.runAsync(
    `DELETE FROM ${TABLE_NAMES.people} WHERE id = ?`,
    [id],
  )

  return result.changes > 0
}

export async function getPersonDeletionImpact(
  database: SQLiteDatabase,
  id: string,
): Promise<PersonDeletionImpact> {
  const row = await database.getFirstAsync<{
    activeLoanCount: number
    outstandingBalance: number
  }>(
    `SELECT
      COUNT(*) AS activeLoanCount,
      COALESCE(SUM(loan_balance), 0) AS outstandingBalance
    FROM (
      SELECT
        l.id,
        l.amount_in_cents
          - COALESCE(SUM(p.amount_in_cents), 0) AS loan_balance
      FROM ${TABLE_NAMES.loans} l
      LEFT JOIN ${TABLE_NAMES.payments} p
        ON p.loan_id = l.id
      WHERE l.person_id = ?
        AND l.status = 'active'
      GROUP BY
        l.id,
        l.amount_in_cents
    ) AS active_loans;`,
    [id],
  )

  return {
    activeLoanCount: row?.activeLoanCount ?? 0,
    outstandingBalance: Money.fromCents(row?.outstandingBalance ?? 0),
  }
}
