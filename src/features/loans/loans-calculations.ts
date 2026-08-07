import { Money } from '../../money'

export type LoanStatus = 'active' | 'paid'

export interface LoanSummary {
  amount: Money
  totalPaid: Money
  outstandingBalance: Money
  status: LoanStatus
}

export function calculateOutstandingBalance(
  amountInCents: number,
  totalPaidInCents: number,
): number {
  if (!Number.isInteger(amountInCents) || amountInCents < 0) {
    throw new Error('Amount in cents must be a non-negative integer.')
  }

  if (!Number.isInteger(totalPaidInCents) || totalPaidInCents < 0) {
    throw new Error('Total paid in cents must be a non-negative integer.')
  }

  if (totalPaidInCents > amountInCents) {
    throw new Error(
      'Total paid in cents cannot exceed loan amount in cents (negative balance).',
    )
  }

  return amountInCents - totalPaidInCents
}

export function deriveLoanStatus(
  amountInCents: number,
  totalPaidInCents: number,
): LoanStatus {
  const balance = calculateOutstandingBalance(amountInCents, totalPaidInCents)
  return balance === 0 ? 'paid' : 'active'
}

export function calculateLoanSummary(
  amountInCents: number,
  totalPaidInCents: number,
): LoanSummary {
  const balanceInCents = calculateOutstandingBalance(
    amountInCents,
    totalPaidInCents,
  )
  const status = deriveLoanStatus(amountInCents, totalPaidInCents)

  return {
    amount: Money.fromCents(amountInCents),
    totalPaid: Money.fromCents(totalPaidInCents),
    outstandingBalance: Money.fromCents(balanceInCents),
    status,
  }
}
