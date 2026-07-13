import type { Person } from '../../../domain/entities/person'
import type { PersonRepository } from '../../repositories/person-repository'

export type GeneratePersonId = () => string

export interface CreatePersonInput {
    name: string
    phone?: string | null
    note?: string | null
}

export type CreatePersonResult =
    | { success: true; person: Person }
    | { success: false; reason: 'name_required' }

export class CreatePersonUseCase {
    constructor(
        private readonly personRepository: PersonRepository,
        private readonly generateId: GeneratePersonId,
    ) {}

    async execute(input: CreatePersonInput): Promise<CreatePersonResult> {
        const name = input.name.trim()

        if (!name) return { success: false, reason: 'name_required' }

        const id = this.generateId()
        const phone = input.phone?.trim() || null
        const note = input.note?.trim() || null
        const timestamp = new Date().toISOString()

        const person: Person = {
            id,
            name,
            phone,
            note,
            createdAt: timestamp,
            updatedAt: timestamp,
        }

        const success = await this.personRepository.insert(person)

        if (!success) throw new Error('Failed to create person')

        return { success: true, person }
    }
}
