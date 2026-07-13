import { createContext, type PropsWithChildren, useContext } from 'react'

import { theme, type AppTheme } from './theme'

const ThemeContext = createContext<AppTheme>(theme)

export function ThemeProvider({ children }: PropsWithChildren) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
