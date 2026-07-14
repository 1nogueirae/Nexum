import { Stack } from 'expo-router'
import { SQLiteProvider } from 'expo-sqlite'
import { StatusBar } from 'expo-status-bar'

import { initializeDatabaseAsync } from '../database/connection'
import { DATABASE_NAME } from '../database/schema'
import { theme } from '../theme'

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME}
      onInit={initializeDatabaseAsync}
    >
      <>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.colors.background },
            headerStyle: { backgroundColor: theme.colors.primaryDark },
            headerTintColor: theme.colors.surface,
            headerTitleStyle: {
              ...theme.typography.title,
              color: theme.colors.surface,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="pessoa_detalhes"
            options={({ route }) => {
              const params = route.params as { name?: unknown } | undefined
              return {
                title:
                  typeof params?.name === 'string'
                    ? params.name
                    : 'Detalhes da pessoa',
              }
            }}
          />
        </Stack>
      </>
    </SQLiteProvider>
  )
}
