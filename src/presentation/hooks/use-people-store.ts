import { useStore } from 'zustand'

import { useAppDependencies } from '../providers/app-dependencies-provider'
import type { PeopleStoreState } from '../stores/people-store'

export function usePeopleStore<T>(selector: (state: PeopleStoreState) => T): T {
  const { stores } = useAppDependencies()
  return useStore(stores.people, selector)
}
