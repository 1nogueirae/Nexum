import type { PersonRow } from '../database/schema'
import type { Person } from '../../domain/entities/person'

export function mapPersonRow(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
