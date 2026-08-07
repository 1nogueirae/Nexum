import { useSQLiteContext } from 'expo-sqlite'
import * as React from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import {
  createLoan,
  updateLoan,
  type LoanListItem,
} from '../features/loans/loans'
import { getLoanPaymentCount } from '../features/loans/loans-database'
import { listPeople, type PersonListItem } from '../features/people/people'
import { theme } from '../theme'
import { formatCentsToBrlInput, parseBrlToCents } from '../utils'
import { BaseModal } from './BaseModal'

export interface LoanFormModalProps {
  showForm: boolean
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>
  editingLoan?: LoanListItem | null
  personId?: string
  personName?: string
  onSuccess?: () => void
}

export function LoanFormModal({
  showForm,
  setShowForm,
  editingLoan,
  personId: initialPersonId,
  personName: initialPersonName,
  onSuccess,
}: LoanFormModalProps) {
  const database = useSQLiteContext()

  const [selectedPersonId, setSelectedPersonId] = React.useState(
    initialPersonId ?? '',
  )
  const [people, setPeople] = React.useState<PersonListItem[]>([])
  const [amountInput, setAmountInput] = React.useState('')
  const [dateInput, setDateInput] = React.useState(
    new Date().toISOString().split('T')[0],
  )
  const [description, setDescription] = React.useState('')
  const [hasPayments, setHasPayments] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isEditing = Boolean(editingLoan)

  React.useEffect(() => {
    if (!showForm) return

    const initForm = async () => {
      setFormError(null)

      if (editingLoan) {
        setSelectedPersonId(editingLoan.personId)
        setAmountInput(formatCentsToBrlInput(editingLoan.amountInCents))
        setDateInput(editingLoan.date)
        setDescription(editingLoan.description ?? '')

        const count = await getLoanPaymentCount(database, editingLoan.id)
        setHasPayments(count > 0)
      } else {
        setSelectedPersonId(initialPersonId ?? '')
        setAmountInput('')
        setDateInput(new Date().toISOString().split('T')[0])
        setDescription('')
        setHasPayments(false)

        if (!initialPersonId) {
          const list = await listPeople(database)
          setPeople(list)
          if (list.length > 0) {
            setSelectedPersonId((prev) => prev || list[0].id)
          }
        }
      }
    }

    initForm()
  }, [showForm, editingLoan, initialPersonId, database])

  const handleSubmit = async () => {
    const targetPersonId = (selectedPersonId || initialPersonId)?.trim()
    if (!targetPersonId) {
      setFormError('Selecione uma pessoa para o empréstimo.')
      return
    }

    const amountInCents = parseBrlToCents(amountInput)
    if (!amountInCents || amountInCents <= 0) {
      setFormError('Informe um valor válido maior que zero.')
      return
    }

    if (!dateInput || !dateInput.trim()) {
      setFormError('Informe uma data para o empréstimo.')
      return
    }

    try {
      setIsSubmitting(true)
      setFormError(null)

      if (editingLoan) {
        const result = await updateLoan(database, {
          id: editingLoan.id,
          personId: targetPersonId,
          amountInCents,
          date: dateInput.trim(),
          description: description.trim() || null,
        })

        if (!result.success) {
          if (result.reason === 'amount_change_not_allowed') {
            setFormError(
              'Não é possível alterar o valor de um empréstimo com pagamentos registrados.',
            )
          } else if (result.reason === 'invalid_amount') {
            setFormError('O valor deve ser maior que zero.')
          } else if (result.reason === 'invalid_date') {
            setFormError('A data é obrigatória.')
          } else if (result.reason === 'person_not_found') {
            setFormError('Pessoa não encontrada.')
          } else if (result.reason === 'loan_not_found') {
            setFormError('Empréstimo não encontrado.')
          }
          return
        }
      } else {
        const result = await createLoan(database, {
          personId: targetPersonId,
          amountInCents,
          date: dateInput.trim(),
          description: description.trim() || null,
        })

        if (!result.success) {
          if (result.reason === 'invalid_amount') {
            setFormError('O valor deve ser maior que zero.')
          } else if (result.reason === 'invalid_date') {
            setFormError('A data é obrigatória.')
          } else if (result.reason === 'person_not_found') {
            setFormError('Pessoa não encontrada.')
          }
          return
        }
      }

      setShowForm(false)
      onSuccess?.()
    } catch {
      setFormError('Erro ao salvar o empréstimo. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const lockedPersonName =
    initialPersonName ||
    editingLoan?.personName ||
    people.find((p) => p.id === selectedPersonId)?.name

  return (
    <BaseModal
      visible={showForm}
      onClose={() => setShowForm(false)}
      title={isEditing ? 'Editar Empréstimo' : 'Novo Empréstimo'}
    >
      <View style={styles.formContainer}>
        {Boolean(lockedPersonName) && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pessoa</Text>
            <Text style={styles.lockedValue}>{lockedPersonName}</Text>
          </View>
        )}

        {!initialPersonId && !isEditing && people.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pessoa *</Text>
            <View style={styles.peoplePickerContainer}>
              {people.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.personChip,
                    selectedPersonId === p.id && styles.personChipSelected,
                  ]}
                  onPress={() => setSelectedPersonId(p.id)}
                >
                  <Text
                    style={[
                      styles.personChipText,
                      selectedPersonId === p.id &&
                        styles.personChipTextSelected,
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Valor (R$) *</Text>
          <TextInput
            value={amountInput}
            onChangeText={setAmountInput}
            placeholder="Ex: 150,00"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="decimal-pad"
            editable={!hasPayments}
            style={[styles.input, hasPayments && styles.disabledInput]}
          />
          {hasPayments && (
            <Text style={styles.noticeText}>
              Não é possível alterar o valor original de um empréstimo com
              pagamentos registrados.
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Data *</Text>
          <TextInput
            value={dateInput}
            onChangeText={setDateInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Descrição / Observação</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Conserto do carro"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={2}
            style={[styles.input, styles.textAreaInput]}
          />
        </View>

        {Boolean(formError) && (
          <Text style={styles.errorText}>{formError}</Text>
        )}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submittingButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting
              ? 'Salvando...'
              : isEditing
                ? 'Salvar Alterações'
                : 'Criar Empréstimo'}
          </Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  )
}

const styles = StyleSheet.create({
  formContainer: {
    gap: theme.spacing.md,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
  },
  lockedValue: {
    ...theme.typography.subtitle,
    color: theme.colors.primaryDark,
    paddingVertical: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.radii.button,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  disabledInput: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textSecondary,
  },
  textAreaInput: {
    minHeight: theme.spacing.xl + theme.spacing.lg,
    textAlignVertical: 'top',
  },
  noticeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
  peoplePickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  personChip: {
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.radii.button,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
  },
  personChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  personChipText: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  personChipTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.button,
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  submittingButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...theme.typography.subtitle,
    color: theme.colors.surface,
    fontWeight: '600',
  },
})
