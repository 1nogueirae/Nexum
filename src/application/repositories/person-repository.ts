import type { Person } from '../../domain/entities/person'

import { Money } from '../../domain/value-objects/money'

export type PersonDeletionImpact = {
    activeLoanCount: number
    outstandingBalance: Money
}

export interface PersonRepository {
    listAll(): Promise<readonly Person[]>
    searchById(id: string): Promise<Person | null>
    insert(person: Person): Promise<boolean>
    update(person: Person): Promise<boolean>
    delete(id: string): Promise<boolean>

    getDeletionImpact(id: string): Promise<PersonDeletionImpact>
}
