import type { SQLiteDatabase } from 'expo-sqlite'

import type { PersonRepository } from '../../application/repositories/person-repository'
import { mapPersonRow } from '../mappers/person-mapper'
import { TABLE_NAMES, type PersonRow } from '../database/schema'

import type { Person } from '../../domain/entities/person'

import { Money } from '../../domain/value-objects/money'

export class SQLitePersonRepository implements PersonRepository {
    constructor(private readonly database: SQLiteDatabase) {}

    async listAll() {
        const rows = await this.database.getAllAsync<PersonRow>(
            `SELECT * FROM ${TABLE_NAMES.people} ORDER BY name COLLATE NOCASE`,
        )

        return rows.map(mapPersonRow)
    }

    async searchById(id: string) {
        const row = await this.database.getFirstAsync<PersonRow>(
            `SELECT * FROM ${TABLE_NAMES.people} WHERE id = ?`,
            [id],
        )

        return row ? mapPersonRow(row) : null
    }

    async insert(person: Person) {
        const result = await this.database.runAsync(
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

    async update(person: Person) {
        const result = await this.database.runAsync(
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

    async delete(id: string) {
        const result = await this.database.runAsync(
            `DELETE FROM ${TABLE_NAMES.people} WHERE id = ?`,
            [id],
        )

        return result.changes > 0
    }

    async getDeletionImpact(id: string) {
        const row = await this.database.getFirstAsync<{
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
}
