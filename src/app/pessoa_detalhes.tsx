import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { Avatar } from '../components/Avatar'
import { ConfirmModal } from '../components/ConfirmModal'
import { LoanCard } from '../components/LoanCard'
import { PersonFormModal } from '../components/PersonFormModal'
import {
  listLoansByPerson,
  type LoanListItem,
} from '../features/loans/loans'
import {
  deletePerson,
  findPerson,
  type PersonListItem,
} from '../features/people/people'
import { theme } from '../theme'

export default function PersonDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const database = useSQLiteContext()

  const [person, setPerson] = useState<PersonListItem | null>(null)
  const [loans, setLoans] = useState<LoanListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [showEditModal, setShowEditModal] = useState(false)
  const [page, setPage] = useState<'about' | 'actives' | 'paids'>('about')

  const [deleteConfirmation, setDeleteConfirmation] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchPersonData = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)

      const personData = await findPerson(database, id)
      const personLoans = await listLoansByPerson(database, id)

      setPerson(personData)
      setLoans(personLoans)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [database, id])

  useFocusEffect(
    useCallback(() => {
      let isActive = true

      const loadData = async () => {
        if (!id) return
        try {
          setIsLoading(true)
          setError(null)

          const personData = await findPerson(database, id)
          const personLoans = await listLoansByPerson(database, id)

          if (isActive) {
            setPerson(personData)
            setLoans(personLoans)
          }
        } catch (err) {
          if (isActive) setError(err as Error)
        } finally {
          if (isActive) setIsLoading(false)
        }
      }

      loadData()

      return () => {
        isActive = false
      }
    }, [database, id]),
  )

  const handleRequestDelete = async () => {
    if (!person) return
    try {
      setIsDeleting(true)
      setDeleteError(null)

      const result = await deletePerson(database, {
        id: person.id,
        confirmDeletion: false,
      })

      if (!result.success) {
        if (result.reason === 'confirmation_required') {
          const { impact } = result
          if (impact.activeLoanCount > 0) {
            const loanText =
              impact.activeLoanCount === 1
                ? '1 empréstimo ativo'
                : `${impact.activeLoanCount} empréstimos ativos`
            setDeleteMessage(
              `Esta pessoa possui ${loanText} com saldo devedor total de ${impact.outstandingBalance.format()}. Tem certeza que deseja excluí-la? Todos os empréstimos e pagamentos associados serão removidos.`,
            )
          } else {
            setDeleteMessage(
              `Tem certeza que deseja excluir ${person.name}? Essa ação é permanente.`,
            )
          }
          setDeleteConfirmation(true)
        } else if (result.reason === 'person_not_found') {
          setError(new Error('Pessoa não encontrada.'))
        }
      }
    } catch {
      setError(new Error('Erro ao verificar impacto de exclusão.'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!person) return
    try {
      setIsDeleting(true)
      setDeleteError(null)

      const result = await deletePerson(database, {
        id: person.id,
        confirmDeletion: true,
      })

      if (result.success) {
        setDeleteConfirmation(false)
        router.back()
      } else if (result.reason === 'person_not_found') {
        setDeleteError('Pessoa não encontrada.')
      }
    } catch {
      setDeleteError('Erro ao excluir pessoa. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenLoanDetails = (loanId: string) => {
    router.push({
      pathname: '/emprestimo_detalhes',
      params: { id: loanId },
    })
  }

  const handleCreateLoan = () => {
    if (!person) return
    router.push({
      pathname: '/novo_emprestimo',
      params: { personId: person.id, personName: person.name },
    })
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={theme.typography.body}>Carregando pessoa...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={theme.typography.body}>
          Não foi possível carregar os dados da pessoa.
        </Text>
      </View>
    )
  }

  if (!person) {
    return (
      <View style={styles.centerContainer}>
        <Text style={theme.typography.body}>Pessoa não encontrada.</Text>
      </View>
    )
  }

  const activeLoans = loans.filter((l) => l.status === 'active')
  const paidLoans = loans.filter((l) => l.status === 'paid')

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Avatar person={person} size={70} />
          <View style={styles.personHeaderInfo}>
            <Text style={theme.typography.subtitle}>{person.name}</Text>
            <Text style={styles.balanceLabel}>Saldo devedor total:</Text>
            <Text style={theme.typography.money}>
              {person.outstandingBalance.format()}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleRequestDelete}
              disabled={isDeleting}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="delete"
                size={24}
                color={theme.colors.error}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowEditModal(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="edit"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerTabs}>
          <TouchableOpacity
            style={[
              styles.headerTab,
              page === 'about' && styles.headerTabActive,
            ]}
            onPress={() => setPage('about')}
          >
            <Text
              style={[
                styles.headerTabText,
                page === 'about' && styles.headerTabTextActive,
              ]}
            >
              Sobre
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.headerTab,
              page === 'actives' && styles.headerTabActive,
            ]}
            onPress={() => setPage('actives')}
          >
            <Text
              style={[
                styles.headerTabText,
                page === 'actives' && styles.headerTabTextActive,
              ]}
            >
              Ativos ({activeLoans.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.headerTab,
              page === 'paids' && styles.headerTabActive,
            ]}
            onPress={() => setPage('paids')}
          >
            <Text
              style={[
                styles.headerTabText,
                page === 'paids' && styles.headerTabTextActive,
              ]}
            >
              Quitados ({paidLoans.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {page === 'about' && (
          <View style={styles.aboutCard}>
            <Text style={styles.sectionTitle}>Informações de contato</Text>
            <View style={styles.infoRow}>
              <MaterialIcons
                name="phone"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={theme.typography.body}>
                {person.phone || 'Nenhum telefone cadastrado'}
              </Text>
            </View>
            {Boolean(person.note) && (
              <View style={styles.infoRow}>
                <MaterialIcons
                  name="notes"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={theme.typography.body}>{person.note}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.addLoanButton}
              onPress={handleCreateLoan}
            >
              <MaterialIcons
                name="add-circle-outline"
                size={22}
                color={theme.colors.surface}
              />
              <Text style={styles.addLoanButtonText}>Novo Empréstimo</Text>
            </TouchableOpacity>
          </View>
        )}

        {page === 'actives' && (
          <View style={styles.listSection}>
            {activeLoans.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={theme.typography.body}>
                  Nenhum empréstimo ativo.
                </Text>
                <TouchableOpacity
                  style={styles.addLoanButton}
                  onPress={handleCreateLoan}
                >
                  <MaterialIcons
                    name="add-circle-outline"
                    size={22}
                    color={theme.colors.surface}
                  />
                  <Text style={styles.addLoanButtonText}>
                    Novo Empréstimo
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                style={styles.cardGroup}
                data={activeLoans}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <LoanCard
                    loan={item}
                    lastItem={index === activeLoans.length - 1}
                    onPress={() => handleOpenLoanDetails(item.id)}
                  />
                )}
              />
            )}
          </View>
        )}

        {page === 'paids' && (
          <View style={styles.listSection}>
            {paidLoans.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={theme.typography.body}>
                  Nenhum empréstimo quitado.
                </Text>
              </View>
            ) : (
              <FlatList
                style={styles.cardGroup}
                data={paidLoans}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <LoanCard
                    loan={item}
                    lastItem={index === paidLoans.length - 1}
                    onPress={() => handleOpenLoanDetails(item.id)}
                  />
                )}
              />
            )}
          </View>
        )}
      </View>

      {showEditModal && (
        <PersonFormModal
          showForm={showEditModal}
          setShowForm={setShowEditModal}
          editingPerson={person}
          onSuccess={fetchPersonData}
        />
      )}

      <ConfirmModal
        visible={deleteConfirmation}
        onClose={() => {
          setDeleteConfirmation(false)
          setDeleteError(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={deleteMessage}
        error={deleteError}
        confirmText="Excluir"
        cancelText="Cancelar"
        isSubmitting={isDeleting}
        isDanger
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
  headerContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  personHeaderInfo: {
    flex: 1,
    minWidth: 0,
  },
  balanceLabel: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  headerTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  headerTabActive: {
    borderBottomColor: theme.colors.primaryDark,
  },
  headerTabText: {
    ...theme.typography.subtitle,
    color: theme.colors.textSecondary,
  },
  headerTabTextActive: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  aboutCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.card,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  listSection: {
    flex: 1,
  },
  cardGroup: {
    flexGrow: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.cardGroup,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  addLoanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.button,
    marginTop: theme.spacing.xs,
  },
  addLoanButtonText: {
    ...theme.typography.body,
    color: theme.colors.surface,
    fontWeight: '600',
  },
})