import { StyleSheet, Text, View } from 'react-native'

import { theme } from '../../theme'

export default function PaidOffRoute() {
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>
        Quitados
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
