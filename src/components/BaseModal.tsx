import * as React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View, type ModalProps } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import { theme } from '../theme'

export interface BaseModalProps {
    visible: boolean
    onClose: () => void
    title?: string
    showCloseButton?: boolean
    children: React.ReactNode
    animationType?: ModalProps['animationType']
}

export function BaseModal({
    visible,
    onClose,
    title,
    showCloseButton = true,
    children,
    animationType = 'fade',
}: BaseModalProps) {
    return (
        <Modal
            visible={visible}
            animationType={animationType}
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {(Boolean(title) || showCloseButton) && (
                        <View style={styles.modalHeader}>
                            <Text style={theme.typography.title}>
                                {title ?? ''}
                            </Text>
                            {showCloseButton ? (
                                <TouchableOpacity
                                    onPress={onClose}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    )}
                    {children}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.card,
        padding: theme.spacing.lg,
        width: '100%',
        maxWidth: 400,
        ...theme.shadows.card,
    },
    modalHeader: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
})
