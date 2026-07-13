import { createContext, type PropsWithChildren, useContext } from 'react'

import type { AppDependencies } from '../../composition/create-app-dependencies'

const AppDependenciesContext = createContext<AppDependencies | null>(null)

interface AppDependenciesProviderProps extends PropsWithChildren {
  dependencies: AppDependencies
}

export function AppDependenciesProvider({
  children,
  dependencies,
}: AppDependenciesProviderProps) {
  return (
    <AppDependenciesContext.Provider value={dependencies}>
      {children}
    </AppDependenciesContext.Provider>
  )
}

export function useAppDependencies() {
  const dependencies = useContext(AppDependenciesContext)

  if (!dependencies) {
    throw new Error(
      'useAppDependencies must be used inside AppDependenciesProvider',
    )
  }

  return dependencies
}
