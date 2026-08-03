import * as React from 'react'
import { useCallback } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'

import { useSQLiteContext } from 'expo-sqlite'
import { listPeople, type PersonListItem } from '../../features/people/people'

import { StyleSheet, Text, View, FlatList, Pressable, TouchableOpacity, TextInput } from 'react-native'
import { StyleSheet, Text, View, FlatList, Pressable, TouchableOpacity, TextInput } from 'react-native'

import { PersonCard } from '../../components/PersonCard'

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { theme } from '../../theme'

function FloatingAddButton({
    showForm,
    setShowForm,
}: {
    showForm: boolean
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>
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
            <TouchableOpacity
                onPress={() => {
                    setShowForm(!showForm)
                }}
            >
                <MaterialIcons name="add" size={42} color={theme.colors.surface} />
            </TouchableOpacity>
        </View>
    )
}

function FormModal({
    showForm,
    setShowForm,
}: {
    showForm: boolean
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>
}) {

    return (
        <Pressable
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            onPress={() => setShowForm(false)}
        >
            <View
                style={{
                    backgroundColor: theme.colors.surface,
                    width: '90%',
                    padding: theme.spacing.md,
                    borderRadius: theme.radii.card,
                    minHeight: 400,
                }}>

                <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.divider, flexDirection: 'row' }}>
                    <Text style={{
                        ...theme.typography.title,
                        textAlign: 'center',
                        marginBottom: theme.spacing.md,
                    }}>
                        Formulário de Pessoa
                    </Text>
                    <Text>X</Text>
                </View>

                <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.md }}>
                    <TextInput
                        placeholder="Nome"
                    />
                    <TextInput
                        placeholder="Email"
                    />
                    <TextInput
                        placeholder="Telefone"
                    />
                </View>

            </View>

        </Pressable>
    )
}


export default function PeopleRoute() {

    const router = useRouter()
    const database = useSQLiteContext()

    const [people, setPeople] = React.useState<PersonListItem[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<Error | null>(null)

    const [showForm, setShowForm] = React.useState(false)

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
        <View style={[styles.container]}>
            <View style={{ gap: theme.spacing.sm }}>
                {people.length === 0 ? (
                    <Text style={{ ...theme.typography.body, textAlign: 'center', marginTop: theme.spacing.md }}>
                        Nenhuma pessoa cadastrada. Clique no botão abaixo para adicionar uma nova pessoa.
                    </Text>
                ) : (
                    <>
                        <Text style={theme.typography.caption}>{people.length} pessoas</Text>
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
            <FloatingAddButton showForm={showForm} setShowForm={setShowForm} />

            {showForm && (
                <FormModal showForm={showForm} setShowForm={setShowForm} />
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
    cardGroup: {
        flexGrow: 0,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.cardGroup,
        overflow: 'hidden',
    }
})
