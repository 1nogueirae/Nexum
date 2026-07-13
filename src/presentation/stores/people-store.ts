import { createStore, type StoreApi } from 'zustand/vanilla'

import type { ListPeopleUseCase } from '../../application/use-cases/people/list-people'
import type { Person } from '../../domain/entities/person'

export interface PeopleStoreState {
  error: string | null
  isLoading: boolean
  people: readonly Person[]
  searchQuery: string
  loadPeople: () => Promise<void>
  setSearchQuery: (searchQuery: string) => void
}

export function createPeopleStore(
  listPeople: ListPeopleUseCase,
): StoreApi<PeopleStoreState> {
  return createStore<PeopleStoreState>()((set) => ({
    error: null,
    isLoading: false,
    people: [],
    searchQuery: '',
    loadPeople: async () => {
      set({ error: null, isLoading: true })

      try {
        const people = await listPeople.execute()
        set({ isLoading: false, people })
      } catch {
        set({
          error: 'Não foi possível carregar as pessoas. Tente novamente.',
          isLoading: false,
        })
      }
    },
    setSearchQuery: (searchQuery) => set({ searchQuery }),
  }))
}
