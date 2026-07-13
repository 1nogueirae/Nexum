import type { Person } from '../../../domain/entities/person'
import type {
    PersonDeletionImpact,
    PersonRepository,
} from '../../repositories/person-repository'

export interface DeletePersonInput {
    id: string
    confirmDeletion: boolean
}

export type DeletePersonResult =
    | { success: true; person: Person }
    | { success: false; reason: 'person_not_found' }
    | {
          success: false
          reason: 'confirmation_required'
          person: Person
          impact: PersonDeletionImpact
      }

export class DeletePersonUseCase {
    constructor(private readonly personRepository: PersonRepository) {}

    async execute(input: DeletePersonInput): Promise<DeletePersonResult> {
        const person = await this.personRepository.searchById(input.id)

        if (!person) return { success: false, reason: 'person_not_found' }

        const impact = await this.personRepository.getDeletionImpact(input.id)

        if (!input.confirmDeletion) {
            return {
                success: false,
                reason: 'confirmation_required',
                person,
                impact,
            }
        }

        const success = await this.personRepository.delete(input.id)

        if (!success) throw new Error('Failed to delete person')

        return { success: true, person }
    }
}
