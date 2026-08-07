import * as React from 'react'
import { useCallback } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'

import { useSQLiteContext } from 'expo-sqlite'
import {
    listPeople,
    type Person,
    type PersonListItem,
} from '../../features/people/people'

import { StyleSheet, Text, View, FlatList, Pressable, TouchableOpacity } from 'react-native'

import { PersonCard } from '../../components/PersonCard'
import { PersonFormModal } from '../../components/PersonFormModal'

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { theme } from '../../theme'

function FloatingAddButton({
    onPress,
}: {
    onPress: () => void
}) {
    return (
        <View
            style={{
                position: 'absolute',
                bottom: theme.spacing.lg,
                right: theme.spacing.lg,
                backgroundColor: theme.colors.primary,
                borderRadius: 34,
                padding: theme.spacing.sm,
                ...theme.shadows.fab,

            }}
        >
            <TouchableOpacity onPress={onPress}>
                <MaterialIcons name="add" size={42} color={theme.colors.surface} />
            </TouchableOpacity>
        </View>
    )
}

export default function PeopleRoute() {

    const router = useRouter()
    const database = useSQLiteContext()

    const [people, setPeople] = React.useState<PersonListItem[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<Error | null>(null)

    const [showForm, setShowForm] = React.useState(false)
    const [editingPerson, setEditingPerson] = React.useState<PersonListItem | Person | null>(null)

    const fetchPeople = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const peopleList = await listPeople(database)

            setPeople(peopleList)
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [database])

    useFocusEffect(
        useCallback(() => {
            let isActive = true

            const loadData = async () => {
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
            loadData()
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

    const handleOpenAddModal = () => {
        setEditingPerson(null)
        setShowForm(true)
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {people.length === 0 ? (
                    <Text style={{ ...theme.typography.body, textAlign: 'center', marginTop: theme.spacing.md }}>
                        Nenhuma pessoa cadastrada. Clique no botão abaixo para adicionar uma nova pessoa.
                    </Text>
                ) : (
                    <>
                        <Text style={styles.peopleCountText}>
                            {people.length} {people.length === 1 ? 'pessoa' : 'pessoas'}
                        </Text>
                        <FlatList
                            style={styles.cardGroup}
                            data={people}
                            keyExtractor={(item) => item.id}
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
                    </>
                )}
            </View>
            <FloatingAddButton onPress={handleOpenAddModal} />

            {showForm && (
                <PersonFormModal
                    showForm={showForm}
                    setShowForm={setShowForm}
                    editingPerson={editingPerson}
                    onSuccess={fetchPeople}
                />
            )}
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
    peopleCountText: {
        ...theme.typography.caption,
        textAlign: 'center',
    },
    cardGroup: {
        flexGrow: 0,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.cardGroup,
        overflow: 'hidden',
    },
})

