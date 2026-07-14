import { type PersonListItem } from '../features/people/people'

import { StyleSheet, Text, View } from 'react-native'

import { Avatar } from './Avatar'
import { theme } from '../theme'

type PersonCardProps = {
    person: PersonListItem
    lastPerson: boolean
}
export function PersonCard({ person, lastPerson }: PersonCardProps) {

    return (
        <View style={[styles.card,
        {
            borderBottomWidth: lastPerson ?
                0
                :
                1, borderBottomColor: theme.colors.divider
        }]}>

            <View style={styles.card_content}>

                <View style={{ marginRight: theme.spacing.xs }}>
                    <Avatar person={person} />
                </View>

                <View style={{ flex: 1, minWidth: 0, gap: theme.spacing.xs }}>
                    <Text style={styles.name}>{person.name}</Text>
                    <Text style={styles.balance}>
                        Saldo devedor: {person.outstandingBalance.format()}
                    </Text>
                </View>

                <View>
                    <Text style={styles.card_chevron}>{'>'}</Text>
                </View>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        padding: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    name: {
        color: theme.colors.text,
        fontSize: theme.typography.subtitle.fontSize,
        fontWeight: theme.typography.subtitle.fontWeight,
    },
    balance: {
        color: theme.colors.primaryDark,
        fontSize: theme.typography.body.fontSize,
        fontWeight: theme.typography.body.fontWeight,
    },
    card_chevron: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.subtitle.fontSize,
        fontWeight: theme.typography.subtitle.fontWeight,
    },
    card_content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})