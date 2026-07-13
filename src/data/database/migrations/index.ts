import type { SQLiteDatabase } from 'expo-sqlite'

import { SCHEMA_VERSION } from '../schema'
import { initialSchemaMigration } from './001-initial-schema'

interface Migration {
  name: string
  version: number
  up(database: SQLiteDatabase): Promise<void>
}

const migrations: readonly Migration[] = [initialSchemaMigration]

function validateMigrations() {
  migrations.forEach((migration, index) => {
    const expectedVersion = index + 1

    if (migration.version !== expectedVersion) {
      throw new Error(
        `Invalid database migration order: expected version ${expectedVersion}, received ${migration.version}`,
      )
    }
  })

  if (migrations.at(-1)?.version !== SCHEMA_VERSION) {
    throw new Error(
      `Schema version ${SCHEMA_VERSION} does not match the latest migration`,
    )
  }
}

validateMigrations()

export async function migrateDatabaseAsync(database: SQLiteDatabase) {
  const versionRow = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  )
  const currentVersion = versionRow?.user_version ?? 0

  if (!Number.isInteger(currentVersion) || currentVersion < 0) {
    throw new Error(`Invalid SQLite user_version: ${currentVersion}`)
  }

  if (currentVersion > SCHEMA_VERSION) {
    throw new Error(
      `Database version ${currentVersion} is newer than supported version ${SCHEMA_VERSION}`,
    )
  }

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue
    }

    try {
      await database.withTransactionAsync(async () => {
        await migration.up(database)
        await database.execAsync(`PRAGMA user_version = ${migration.version}`)
      })
    } catch (error) {
      throw new Error(
        `Failed to apply database migration ${migration.version} (${migration.name})`,
        { cause: error },
      )
    }
  }
}
