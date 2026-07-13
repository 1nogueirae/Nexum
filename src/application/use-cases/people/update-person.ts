import type { Person } from '../../../domain/entities/person'
import type { PersonRepository } from '../../repositories/person-repository'

export interface UpdatePersonInput {
    id: string
    name: string
    phone?: string | null
    note?: string | null
}

export type UpdatePersonResult =
    | { success: true; person: Person }
    | { success: false; reason: 'name_required' }
    | { success: false; reason: 'person_not_found' }

export class UpdatePersonUseCase {
    constructor(private readonly personRepository: PersonRepository) {}

    async execute(input: UpdatePersonInput): Promise<UpdatePersonResult> {
        const person = await this.personRepository.searchById(input.id)

        if (!person) return { success: false, reason: 'person_not_found' }

        const name = input.name.trim()

        if (!name) return { success: false, reason: 'name_required' }

        const phone = input.phone?.trim() || null
        const note = input.note?.trim() || null
        const timestamp = new Date().toISOString()

        const updatedPerson: Person = {
            ...person,
            name,
            phone,
            note,
            updatedAt: timestamp,
        }

        const success = await this.personRepository.update(updatedPerson)

        if (!success) throw new Error('Failed to update person')

        return { success: true, person: updatedPerson }
    }
}
