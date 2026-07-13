import type { SQLiteDatabase } from 'expo-sqlite'
import * as Crypto from 'expo-crypto'

import type { PersonRepository } from '../application/repositories/person-repository'

import { ListPeopleUseCase } from '../application/use-cases/people/list-people'
import { CreatePersonUseCase } from '../application/use-cases/people/create-person'
import { UpdatePersonUseCase } from '../application/use-cases/people/update-person'
import { DeletePersonUseCase } from '../application/use-cases/people/delete-person'

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
        createPerson: CreatePersonUseCase
        updatePerson: UpdatePersonUseCase
        deletePerson: DeletePersonUseCase
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
            createPerson: new CreatePersonUseCase(
                peopleRepository,
                Crypto.randomUUID,
            ),
            updatePerson: new UpdatePersonUseCase(peopleRepository),
            deletePerson: new DeletePersonUseCase(peopleRepository),
        },
        stores: {
            loans: createLoansStore(),
            people: createPeopleStore(listPeople),
        },
    }
}
