import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '../presentation/theme/theme-provider'

export default function HomeRoute() {
  const theme = useTheme()

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>
        Nexum
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})
