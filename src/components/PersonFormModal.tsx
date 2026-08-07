import * as React from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSQLiteContext } from 'expo-sqlite'

import {
    createPerson,
    updatePerson,
    type Person,
    type PersonListItem,
} from '../features/people/people'
import { theme } from '../theme'
import { BaseModal } from './BaseModal'

export interface PersonFormModalProps {
    showForm: boolean
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>
    editingPerson?: PersonListItem | Person | null
    onSuccess?: () => void
}

export function PersonFormModal({
    showForm,
    setShowForm,
    editingPerson,
    onSuccess,
}: PersonFormModalProps) {
    const database = useSQLiteContext()
    const [name, setName] = React.useState('')
    const [phone, setPhone] = React.useState('')
    const [note, setNote] = React.useState('')
    const [formError, setFormError] = React.useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const isEditing = Boolean(editingPerson)

    React.useEffect(() => {
        if (showForm) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(editingPerson?.name ?? '')
            setPhone(editingPerson?.phone ?? '')
            setNote(editingPerson?.note ?? '')
            setFormError(null)
        }
    }, [showForm, editingPerson])

    const handleSubmit = async () => {
        const trimmedName = name.trim()
        if (!trimmedName) {
            setFormError('O nome é obrigatório.')
            return
        }

        try {
            setIsSubmitting(true)
            setFormError(null)

            if (editingPerson) {
                const result = await updatePerson(database, {
                    id: editingPerson.id,
                    name: trimmedName,
                    phone: phone.trim() || null,
                    note: note.trim() || null,
                })
                if (!result.success) {
                    if (result.reason === 'name_required') {
                        setFormError('O nome é obrigatório.')
                    } else if (result.reason === 'person_not_found') {
                        setFormError('Pessoa não encontrada.')
                    }
                    return
                }
            } else {
                const result = await createPerson(database, {
                    name: trimmedName,
                    phone: phone.trim() || null,
                    note: note.trim() || null,
                })
                if (!result.success) {
                    if (result.reason === 'name_required') {
                        setFormError('O nome é obrigatório.')
                    }
                    return
                }
            }

            setShowForm(false)
            onSuccess?.()
        } catch {
            setFormError('Erro ao salvar as informações.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <BaseModal
            visible={showForm}
            onClose={() => setShowForm(false)}
            title={isEditing ? 'Editar Pessoa' : 'Nova Pessoa'}
        >
            <View style={{ gap: theme.spacing.md }}>
                <View style={{ gap: theme.spacing.xs }}>
                    <Text style={styles.inputLabel}>Nome *</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex: João Silva"
                        placeholderTextColor={theme.colors.textSecondary}
                        style={styles.input}
                    />
                </View>

                <View style={{ gap: theme.spacing.xs }}>
                    <Text style={styles.inputLabel}>Telefone</Text>
                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Ex: (11) 98765-4321"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />
                </View>

                <View style={{ gap: theme.spacing.xs }}>
                    <Text style={styles.inputLabel}>Observação</Text>
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder="Ex: Amigo da faculdade"
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                        numberOfLines={2}
                        style={[styles.input, styles.textAreaInput]}
                    />
                </View>

                {formError && (
                    <Text style={{ ...theme.typography.caption, color: theme.colors.error }}>
                        {formError}
                    </Text>
                )}

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        isSubmitting && { opacity: 0.7 },
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitButtonText}>
                        {isSubmitting
                            ? 'Salvando...'
                            : isEditing
                            ? 'Salvar Alterações'
                            : 'Cadastrar'}
                    </Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    )
}

const styles = StyleSheet.create({
    inputLabel: {
        ...theme.typography.caption,
        color: theme.colors.text,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.divider,
        borderRadius: theme.radii.button,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        ...theme.typography.body,
        color: theme.colors.text,
    },
    textAreaInput: {
        minHeight: theme.spacing.xl + theme.spacing.lg,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radii.button,
        paddingVertical: theme.spacing.sm + theme.spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.sm,
    },
    submitButtonText: {
        ...theme.typography.subtitle,
        color: theme.colors.surface,
        fontWeight: '600',
    },
})

