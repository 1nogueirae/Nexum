import { useStore } from 'zustand'

import { useAppDependencies } from '../providers/app-dependencies-provider'
import type { LoansStoreState } from '../stores/loans-store'

export function useLoansStore<T>(selector: (state: LoansStoreState) => T): T {
  const { stores } = useAppDependencies()
  return useStore(stores.loans, selector)
}
