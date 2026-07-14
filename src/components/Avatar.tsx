import { View, Text, StyleSheet } from 'react-native'
import { PersonListItem } from '../features/people/people'
import { theme } from '../theme'
import { getInitials } from '../utils'

export function Avatar({ person, size }: { person: PersonListItem | null; size?: number }) {

    const initials = person ? getInitials(person.name) : ''

    const resolvedSize = size ?? 42

    const computedFontSize = resolvedSize * 0.4
    const computedBorderRadius = resolvedSize * 0.8

    return (
        <View style={[styles.avatar, {
            width: resolvedSize,
            height: resolvedSize,
            borderRadius: computedBorderRadius
        }]}>
            <Text style={[styles.text, { fontSize: computedFontSize }]}>
                {initials}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    avatar: {
        borderRadius: theme.radii.avatar,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primaryLight,
    },
    text: {
        color: theme.colors.primaryDark,
        fontWeight: theme.typography.display.fontWeight,
    },
})