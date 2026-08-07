import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { LoanFormModal } from '../../../components/LoanFormModal'
import { findLoan, type LoanListItem } from '../../../features/loans/loans'
import { theme } from '../../../theme'

export default function EditLoanRoute() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const database = useSQLiteContext()

  const [loan, setLoan] = useState<LoanListItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [showForm, setShowForm] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let isActive = true

      const loadLoan = async () => {
        if (!id) return
        try {
          setIsLoading(true)
          setError(null)

          const loanData = await findLoan(database, id)
          if (isActive) setLoan(loanData)
        } catch (err) {
          if (isActive) setError(err as Error)
        } finally {
          if (isActive) setIsLoading(false)
        }
      }

      loadLoan()

      return () => {
        isActive = false
      }
    }, [database, id]),
  )

  const handleClose = () => {
    setShowForm(false)
    router.back()
  }

  const handleSuccess = () => {
    setShowForm(false)
    router.back()
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={theme.typography.body}>Carregando empréstimo...</Text>
      </View>
    )
  }

  if (error || !loan) {
    return (
      <View style={styles.centerContainer}>
        <Text style={theme.typography.body}>
          Empréstimo não encontrado.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LoanFormModal
        showForm={showForm}
        setShowForm={(val) => {
          if (!val) handleClose()
        }}
        editingLoan={loan}
        personId={loan.personId}
        personName={loan.personName}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
})
