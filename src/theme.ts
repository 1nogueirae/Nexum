import type { TextStyle, ViewStyle } from 'react-native'

const colors = {
  primary: '#2F6F5E',
  primaryDark: '#1F4E42',
  background: '#F7F7F5',
  surface: '#FFFFFF',
  text: '#1C1C1C',
  textSecondary: '#6B6B6B',
  success: '#3E8E5A',
  error: '#B3261E',
  divider: '#E3E3E0',
} as const

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

const radii = {
  button: 8,
  card: 12,
} as const

const typography = {
  display: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  money: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
} as const satisfies Record<string, TextStyle>

const shadows = {
  card: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
} as const satisfies Record<string, ViewStyle>

export const theme = {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} as const
