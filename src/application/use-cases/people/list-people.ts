import type { PersonRepository } from '../../repositories/person-repository'

export class ListPeopleUseCase {
  constructor(private readonly peopleRepository: PersonRepository) {}

  execute() {
    return this.peopleRepository.listAll()
  }
}
