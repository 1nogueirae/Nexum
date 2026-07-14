import * as Crypto from 'expo-crypto'
import type { SQLiteDatabase } from 'expo-sqlite'

import type { Money } from '../../money'
import {
  deletePersonRow,
  findPersonById,
  getPersonDeletionImpact,
  insertPersonRow,
  listPersonRows,
  updatePersonRow,
} from './people-database'

export interface Person {
  id: string
  name: string
  phone: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface PersonDeletionImpact {
  activeLoanCount: number
  outstandingBalance: Money
}

export interface CreatePersonInput {
  name: string
  phone?: string | null
  note?: string | null
}

export type CreatePersonResult =
  | { success: true; person: Person }
  | { success: false; reason: 'name_required' }

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

export function listPeople(database: SQLiteDatabase) {
  return listPersonRows(database)
}

export async function createPerson(
  database: SQLiteDatabase,
  input: CreatePersonInput,
): Promise<CreatePersonResult> {
  const name = input.name.trim()

  if (!name) {
    return { success: false, reason: 'name_required' }
  }

  const timestamp = new Date().toISOString()
  const person: Person = {
    id: Crypto.randomUUID(),
    name,
    phone: input.phone?.trim() || null,
    note: input.note?.trim() || null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const success = await insertPersonRow(database, person)

  if (!success) {
    throw new Error('Failed to create person')
  }

  return { success: true, person }
}

export async function updatePerson(
  database: SQLiteDatabase,
  input: UpdatePersonInput,
): Promise<UpdatePersonResult> {
  const person = await findPersonById(database, input.id)

  if (!person) {
    return { success: false, reason: 'person_not_found' }
  }

  const name = input.name.trim()

  if (!name) {
    return { success: false, reason: 'name_required' }
  }

  const updatedPerson: Person = {
    ...person,
    name,
    phone: input.phone?.trim() || null,
    note: input.note?.trim() || null,
    updatedAt: new Date().toISOString(),
  }

  const success = await updatePersonRow(database, updatedPerson)

  if (!success) {
    throw new Error('Failed to update person')
  }

  return { success: true, person: updatedPerson }
}

export async function deletePerson(
  database: SQLiteDatabase,
  input: DeletePersonInput,
): Promise<DeletePersonResult> {
  const person = await findPersonById(database, input.id)

  if (!person) {
    return { success: false, reason: 'person_not_found' }
  }

  const impact = await getPersonDeletionImpact(database, input.id)

  if (!input.confirmDeletion) {
    return {
      success: false,
      reason: 'confirmation_required',
      person,
      impact,
    }
  }

  const success = await deletePersonRow(database, input.id)

  if (!success) {
    throw new Error('Failed to delete person')
  }

  return { success: true, person }
}
