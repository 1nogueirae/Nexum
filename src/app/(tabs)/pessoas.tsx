import * as React from 'react'
import { useCallback } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'

import { useSQLiteContext } from 'expo-sqlite'
import { listPeople, type PersonListItem } from '../../features/people/people'

import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native'

import { PersonCard } from '../../components/PersonCard'

import { theme } from '../../theme'

export default function PeopleRoute() {

    const router = useRouter()
    const database = useSQLiteContext()

    const [people, setPeople] = React.useState<PersonListItem[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<Error | null>(null)

    useFocusEffect(
        useCallback(() => {
            let isActive = true

            const fetchPeople = async () => {
                try {
                    setIsLoading(true)
                    setError(null)

                    const peopleList = await listPeople(database)

                    if (isActive) setPeople(peopleList)
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
        }, [database])
    )

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={theme.typography.body}>Carregando pessoas...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={theme.typography.body}>
                    Não foi possível carregar as pessoas.
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={theme.typography.caption}>{people.length} pessoas</Text>
                <FlatList
                    style={styles.cardGroup}
                    showsVerticalScrollIndicator={false}
                    data={people}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        <Text style={[theme.typography.body, { textAlign: 'center', paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.md }]}>
                            Nenhuma pessoa cadastrada.
                        </Text>
                    }
                    renderItem={({ item, index }) => (
                        <Pressable
                            onPress={() =>
                                router.push({
                                    pathname: '/pessoa_detalhes',
                                    params: { id: item.id, name: item.name },
                                })
                            }
                        >
                            <PersonCard
                                person={item}
                                lastPerson={index === people.length - 1}
                            />
                        </Pressable>
                    )}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    cardGroup: {
        flexGrow: 0,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.cardGroup,
        overflow: 'hidden',
    }
})
