import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { theme } from '../theme'
import { BaseModal } from './BaseModal'

export interface ConfirmModalProps {
    visible: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message: React.ReactNode
    confirmText?: string
    cancelText?: string
    isSubmitting?: boolean
    isDanger?: boolean
    error?: string | null
}

export function ConfirmModal({
    visible,
    onClose,
    onConfirm,
    title = 'Confirmar Ação',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isSubmitting = false,
    isDanger = true,
    error,
}: ConfirmModalProps) {
    return (
        <BaseModal visible={visible} onClose={onClose} title={title}>
            <View style={styles.container}>
                {typeof message === 'string' ? (
                    <Text style={theme.typography.body}>{message}</Text>
                ) : (
                    message
                )}

                {error ? (
                    <Text style={{ ...theme.typography.caption, color: theme.colors.error }}>
                        {error}
                    </Text>
                ) : null}

                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={onClose}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.cancelButtonText}>{cancelText}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            isDanger ? styles.dangerButton : styles.confirmButton,
                            isSubmitting && { opacity: 0.7 },
                        ]}
                        onPress={onConfirm}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.confirmButtonText}>
                            {isSubmitting ? 'Aguarde...' : confirmText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BaseModal>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: theme.spacing.md,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    button: {
        borderRadius: theme.radii.button,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.divider,
    },
    cancelButtonText: {
        ...theme.typography.subtitle,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
    },
    dangerButton: {
        backgroundColor: theme.colors.error,
    },
    confirmButtonText: {
        ...theme.typography.subtitle,
        color: theme.colors.surface,
        fontWeight: '600',
    },
})
