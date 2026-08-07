import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { LoanFormModal } from '../../components/LoanFormModal'
import { theme } from '../../theme'

export default function NewLoanRoute() {
  const router = useRouter()
  const { personId, personName } = useLocalSearchParams<{
    personId?: string
    personName?: string
  }>()

  const [showForm, setShowForm] = useState(true)

  const handleClose = () => {
    setShowForm(false)
    router.back()
  }

  const handleSuccess = () => {
    setShowForm(false)
    router.back()
  }

  return (
    <View style={styles.container}>
      <LoanFormModal
        showForm={showForm}
        setShowForm={(val) => {
          if (!val) handleClose()
        }}
        personId={personId}
        personName={personName}
        onSuccess={handleSuccess}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
})
