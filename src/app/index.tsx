import { StyleSheet, Text, View } from 'react-native'

export default function HomeRoute() {
  return (
    <View style={styles.container}>
      <Text>Nexum</Text>
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
