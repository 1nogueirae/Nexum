import type { Person } from '../../domain/entities/person'

export interface PersonRepository {
  listAll(): Promise<readonly Person[]>
}
