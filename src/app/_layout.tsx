import { Stack } from 'expo-router'
import { SQLiteProvider } from 'expo-sqlite'

import { initializeDatabaseAsync } from '../data/database/connection'
import { DATABASE_NAME } from '../data/database/schema'

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME}
      onInit={initializeDatabaseAsync}
    >
      <Stack />
    </SQLiteProvider>
  )
}
