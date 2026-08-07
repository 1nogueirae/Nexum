import {
  calculateLoanSummary,
  calculateOutstandingBalance,
  deriveLoanStatus,
} from '../loans-calculations'

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: expected ${String(expected)}, got ${String(actual)}${message ? ` (${message})` : ''}`,
    )
  }
}

function assertThrows(fn: () => void, expectedErrorMessage: string) {
  let errorOccurred = false
  try {
    fn()
  } catch (err: unknown) {
    errorOccurred = true
    const message = err instanceof Error ? err.message : String(err)
    if (!message.includes(expectedErrorMessage)) {
      throw new Error(
        `Expected error containing "${expectedErrorMessage}", but got "${message}"`,
      )
    }
  }
  if (!errorOccurred) {
    throw new Error(
      `Expected function to throw error containing "${expectedErrorMessage}", but it did not throw.`,
    )
  }
}

export function runLoansCalculationsTests() {
  assertEqual(calculateOutstandingBalance(10000, 3000), 7000)
  assertEqual(calculateOutstandingBalance(10000, 10000), 0)
  assertEqual(calculateOutstandingBalance(10000, 0), 10000)

  assertThrows(
    () => calculateOutstandingBalance(10000, 15000),
    'Total paid in cents cannot exceed loan amount in cents (negative balance).',
  )

  assertThrows(
    () => calculateOutstandingBalance(-100, 0),
    'Amount in cents must be a non-negative integer.',
  )

  assertThrows(
    () => calculateOutstandingBalance(100.05, 0),
    'Amount in cents must be a non-negative integer.',
  )

  assertThrows(
    () => calculateOutstandingBalance(10000, -50),
    'Total paid in cents must be a non-negative integer.',
  )

  assertEqual(deriveLoanStatus(10000, 3000), 'active')
  assertEqual(deriveLoanStatus(10000, 0), 'active')
  assertEqual(deriveLoanStatus(10000, 10000), 'paid')

  const summary = calculateLoanSummary(10000, 4000)
  assertEqual(summary.amount.getCents(), 10000)
  assertEqual(summary.totalPaid.getCents(), 4000)
  assertEqual(summary.outstandingBalance.getCents(), 6000)
  assertEqual(summary.status, 'active')
}

runLoansCalculationsTests()
