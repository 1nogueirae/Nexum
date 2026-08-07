import { StyleSheet, Text, View, Pressable } from 'react-native'

import type { LoanListItem } from '../features/loans/loans'
import { Money } from '../money'
import { theme } from '../theme'

interface LoanCardProps {
  loan: LoanListItem
  lastItem?: boolean
  onPress?: () => void
}

export function LoanCard({ loan, lastItem = false, onPress }: LoanCardProps) {
  const originalAmount = Money.fromCents(loan.amountInCents).format()
  const isPaid = loan.status === 'paid'

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderBottomWidth: lastItem ? 0 : 1,
          borderBottomColor: theme.colors.divider,
          backgroundColor: pressed
            ? theme.colors.primaryLight
            : theme.colors.surface,
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.description} numberOfLines={1}>
              {loan.description || 'Empréstimo'}
            </Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isPaid
                    ? `${theme.colors.success}1A`
                    : `${theme.colors.primary}1A`,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: isPaid
                      ? theme.colors.success
                      : theme.colors.primary,
                  },
                ]}
              >
                {isPaid ? 'Quitado' : 'Ativo'}
              </Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.dateText}>{loan.date}</Text>
            <Text style={styles.amountText}>Original: {originalAmount}</Text>
          </View>

          {!isPaid && (
            <Text style={styles.balanceText}>
              Saldo devedor: {loan.outstandingBalance.format()}
            </Text>
          )}
        </View>

        <Text style={styles.chevron}>{'>'}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  infoContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  description: {
    ...theme.typography.subtitle,
    flex: 1,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.button,
  },
  badgeText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  dateText: {
    ...theme.typography.caption,
  },
  amountText: {
    ...theme.typography.caption,
    fontWeight: '500',
  },
  balanceText: {
    ...theme.typography.body,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  chevron: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.subtitle.fontSize,
    fontWeight: theme.typography.subtitle.fontWeight,
    marginLeft: theme.spacing.xs,
  },
})
