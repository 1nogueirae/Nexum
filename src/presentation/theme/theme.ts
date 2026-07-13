import { colors, radii, shadows, spacing, typography } from './tokens'

export const theme = {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} as const

export type AppTheme = typeof theme
