import { Text, View, StyleSheet } from 'react-native'

import { useSQLiteContext } from 'expo-sqlite'

import { findPerson, type PersonListItem } from '../features/people/people'

import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

import { theme } from '../theme'

import { Avatar } from '../components/Avatar'

export default function PersonDetailsRoute() {

    const { id } = useLocalSearchParams<{ id: string }>()

    const database = useSQLiteContext()

    const [person, setPerson] = useState<PersonListItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const [page, setPage] = useState<'about' | 'actives' | 'paids'>('about')

    useFocusEffect(
        useCallback(() => {
            let isActive = true

            const fetchPeople = async () => {
                try {
                    setIsLoading(true)
                    setError(null)

                    const person = await findPerson(database, id)

                    if (isActive) setPerson(person)
                } catch (err) {
                    if (isActive) setError(err as Error)
                } finally {
                    if (isActive) setIsLoading(false)
                }
            }
            fetchPeople()
            return () => {
                isActive = false
            }
        }, [database, id])
    )

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
                    <View >
                        <Text style={theme.typography.subtitle}>
                            Saldo devedor total:
                        </Text>
                        <Text style={theme.typography.money}>
                            {person.outstandingBalance.format()}
                        </Text>
                    </View>
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