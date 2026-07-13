import type { SQLiteDatabase } from 'expo-sqlite'

import type { PersonRepository } from '../application/repositories/person-repository'
import { ListPeopleUseCase } from '../application/use-cases/people/list-people'
import { SQLitePersonRepository } from '../data/repositories/sqlite-person-repository'
import {
  createLoansStore,
  type LoansStoreState,
} from '../presentation/stores/loans-store'
import {
  createPeopleStore,
  type PeopleStoreState,
} from '../presentation/stores/people-store'
import type { StoreApi } from 'zustand/vanilla'

export interface AppDependencies {
  repositories: {
    people: PersonRepository
  }
  useCases: {
    listPeople: ListPeopleUseCase
  }
  stores: {
    loans: StoreApi<LoansStoreState>
    people: StoreApi<PeopleStoreState>
  }
}

export function createAppDependencies(
  database: SQLiteDatabase,
): AppDependencies {
  const peopleRepository = new SQLitePersonRepository(database)
  const listPeople = new ListPeopleUseCase(peopleRepository)

  return {
    repositories: {
      people: peopleRepository,
    },
    useCases: {
      listPeople,
    },
    stores: {
      loans: createLoansStore(),
      people: createPeopleStore(listPeople),
    },
  }
}
