import { createStore, type StoreApi } from 'zustand/vanilla'

export type LoanStatusFilter = 'active' | 'paid'

export interface LoansStoreState {
  statusFilter: LoanStatusFilter
  setStatusFilter: (statusFilter: LoanStatusFilter) => void
}

export function createLoansStore(): StoreApi<LoansStoreState> {
  return createStore<LoansStoreState>()((set) => ({
    statusFilter: 'active',
    setStatusFilter: (statusFilter) => set({ statusFilter }),
  }))
}
