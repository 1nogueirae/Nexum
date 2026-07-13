import type { SQLiteDatabase } from 'expo-sqlite'

import type { PersonRepository } from '../../application/repositories/person-repository'
import { mapPersonRow } from '../mappers/person-mapper'
import { TABLE_NAMES, type PersonRow } from '../database/schema'

export class SQLitePersonRepository implements PersonRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async listAll() {
    const rows = await this.database.getAllAsync<PersonRow>(
      `SELECT * FROM ${TABLE_NAMES.people} ORDER BY name COLLATE NOCASE`,
    )

    return rows.map(mapPersonRow)
  }
}
