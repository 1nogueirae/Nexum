import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import { useSQLiteContext } from 'expo-sqlite'

import { findPerson, type PersonListItem, deletePerson } from '../features/people/people'

import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

import { theme } from '../theme'

import { Avatar } from '../components/Avatar'
import { PersonFormModal } from '../components/PersonFormModal'
import { ConfirmModal } from '../components/ConfirmModal'

export default function PersonDetailsRoute() {

    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()

    const database = useSQLiteContext()

    const [person, setPerson] = useState<PersonListItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const [showEditModal, setShowEditModal] = useState(false)
    const [page, setPage] = useState<'about' | 'actives' | 'paids'>('about')

    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteMessage, setDeleteMessage] = useState('')
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const fetchPersonDetails = useCallback(async () => {
        if (!id) return
        try {
            setIsLoading(true)
            setError(null)

            const personData = await findPerson(database, id)

            setPerson(personData)
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
                try {
                    setIsLoading(true)
                    setError(null)

                    const personData = await findPerson(database, id)

                    if (isActive) setPerson(personData)
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
        }, [database, id])
    )

    const handleRequestDelete = async () => {
        if (!person) return
        try {
            setIsDeleting(true)
            setDeleteError(null)

            const result = await deletePerson(database, { id: person.id, confirmDeletion: false })

            if (!result.success) {
                if (result.reason === 'confirmation_required') {
                    const { impact } = result
                    if (impact.activeLoanCount > 0) {
                        const loanText =
                            impact.activeLoanCount === 1
                                ? '1 empréstimo ativo'
                                : `${impact.activeLoanCount} empréstimos ativos`
                        setDeleteMessage(
                            `Esta pessoa possui ${loanText} com saldo devedor total de ${impact.outstandingBalance.format()}. Tem certeza que deseja excluí-la? Todos os empréstimos e pagamentos associados serão removidos.`
                        )
                    } else {
                        setDeleteMessage(`Tem certeza que deseja excluir ${person.name}? Essa ação é permanente.`)
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

            const result = await deletePerson(database, { id: person.id, confirmDeletion: true })

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

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={theme.typography.body}>Carregando pessoa...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={theme.typography.body}>
                    Não foi possível carregar a pessoa.
                </Text>
            </View>
        )
    }

    if (!person) {
        return (
            <View style={styles.container}>
                <Text style={theme.typography.body}>
                    Pessoa não encontrada.
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>

            <View style={styles.header_container}>

                <View style={styles.header_content}>
                    <Avatar person={person} size={70} />
                    <View style={{ flex: 1 }}>
                        <Text style={theme.typography.subtitle}>
                            Saldo devedor total:
                        </Text>
                        <Text style={theme.typography.money}>
                            {person.outstandingBalance.format()}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleRequestDelete}
                        disabled={isDeleting}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons name="delete" size={24} color={theme.colors.error} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setShowEditModal(true)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.header_tabs}>
                    <Text
                        style={[
                            styles.header_tab,
                            page === 'about'
                                ? {
                                    borderBottomWidth: 2,
                                    borderBottomColor: theme.colors.primaryDark,
                                    color: theme.colors.primaryDark,
                                }
                                : null
                        ]}
                        onPress={() => setPage('about')}>Sobre</Text>
                    <Text
                        style={[
                            styles.header_tab,
                            page === 'actives'
                                ? {
                                    borderBottomWidth: 2,
                                    borderBottomColor: theme.colors.primaryDark,
                                    color: theme.colors.primaryDark,
                                }
                                : null
                        ]}
                        onPress={() => setPage('actives')}>Ativos</Text>
                    <Text
                        style={[
                            styles.header_tab,
                            page === 'paids'
                                ? {
                                    borderBottomWidth: 2,
                                    borderBottomColor: theme.colors.primaryDark,
                                    color: theme.colors.primaryDark,
                                }
                                : null
                        ]}
                        onPress={() => setPage('paids')}>Quitados</Text>
                </View>

            </View>

            <View style={styles.content_container}>
                {page === 'about' && (
                    <View>
                        <Text style={theme.typography.body}>
                            {person.name}
                        </Text>
                        <Text style={theme.typography.body}>
                            {person.phone}
                        </Text>
                    </View>
                )}
                {page === 'actives' && (
                    <Text>Construindo...</Text>
                )}
                {page === 'paids' && (
                    <Text>Construindo...</Text>
                )}
            </View>

            {showEditModal && (
                <PersonFormModal
                    showForm={showEditModal}
                    setShowForm={setShowEditModal}
                    editingPerson={person}
                    onSuccess={fetchPersonDetails}
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
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: theme.colors.background,
    },
    header_container: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
        paddingTop: theme.spacing.lg,
        alignItems: 'center',
    },
    header_content: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        paddingBottom: theme.spacing.md,
    },
    header_tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: theme.spacing.md,
        width: '100%',
        marginTop: theme.spacing.md,
    },
    header_tab: {
        flex: 1,
        textAlign: 'center',
        paddingVertical: theme.spacing.sm,
        backgroundColor: "transparent",
        ...theme.typography.subtitle,
    },
    content_container: {
        flex: 1,
        width: '80%',
        marginTop: theme.spacing.md,
        gap: theme.spacing.md,
    }
})