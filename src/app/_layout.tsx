import { useMemo } from 'react'
import { Stack } from 'expo-router'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { StatusBar } from 'expo-status-bar'

import { createAppDependencies } from '../composition/create-app-dependencies'
import { initializeDatabaseAsync } from '../data/database/connection'
import { DATABASE_NAME } from '../data/database/schema'
import { AppDependenciesProvider } from '../presentation/providers/app-dependencies-provider'
import { ThemeProvider } from '../presentation/theme/theme-provider'
import { theme } from '../presentation/theme/theme'

function AppContent() {
  const database = useSQLiteContext()
  const dependencies = useMemo(
    () => createAppDependencies(database),
    [database],
  )

  return (
    <AppDependenciesProvider dependencies={dependencies}>
      <ThemeProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.colors.background },
            headerStyle: { backgroundColor: theme.colors.primaryDark },
            headerTintColor: theme.colors.surface,
            headerTitleStyle: theme.typography.title,
          }}
        />
      </ThemeProvider>
    </AppDependenciesProvider>
  )
}

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME}
      onInit={initializeDatabaseAsync}
    >
      <AppContent />
    </SQLiteProvider>
  )
}
