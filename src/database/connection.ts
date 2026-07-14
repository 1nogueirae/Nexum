import * as SQLite from 'expo-sqlite'
import type { SQLiteDatabase } from 'expo-sqlite'

import { migrateDatabaseAsync } from './migrations'
import { DATABASE_NAME } from './schema'

const initializedDatabases = new WeakMap<SQLiteDatabase, Promise<void>>()

async function configureConnectionAsync(database: SQLiteDatabase) {
  await database.execAsync('PRAGMA journal_mode = WAL')
  await database.execAsync('PRAGMA foreign_keys = ON')

  const foreignKeys = await database.getFirstAsync<{ foreign_keys: number }>(
    'PRAGMA foreign_keys',
  )

  if (foreignKeys?.foreign_keys !== 1) {
    throw new Error('SQLite foreign key enforcement could not be enabled')
  }
}

async function prepareDatabaseAsync(database: SQLiteDatabase) {
  await configureConnectionAsync(database)
  await migrateDatabaseAsync(database)
}

export function initializeDatabaseAsync(database: SQLiteDatabase) {
  const currentInitialization = initializedDatabases.get(database)

  if (currentInitialization) {
    return currentInitialization
  }

  const initialization = prepareDatabaseAsync(database).catch((error) => {
    initializedDatabases.delete(database)
    throw new Error('Failed to initialize the Nexum database', { cause: error })
  })

  initializedDatabases.set(database, initialization)
  return initialization
}

export async function withExclusiveDatabaseTransactionAsync<T>(
  task: (transaction: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  const transaction = await SQLite.openDatabaseAsync(DATABASE_NAME, {
    useNewConnection: true,
  })

  try {
    await initializeDatabaseAsync(transaction)
    await transaction.execAsync('BEGIN IMMEDIATE')

    try {
      const result = await task(transaction)
      await transaction.execAsync('COMMIT')
      return result
    } catch (error) {
      await transaction.execAsync('ROLLBACK')
      throw error
    }
  } finally {
    await transaction.closeAsync()
  }
}
