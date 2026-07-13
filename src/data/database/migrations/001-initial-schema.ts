import type { SQLiteDatabase } from 'expo-sqlite'

export const initialSchemaMigration = {
  name: 'initial schema',
  version: 1,
  async up(database: SQLiteDatabase) {
    await database.execAsync(`
      CREATE TABLE people (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL CHECK (length(trim(name)) > 0),
        phone TEXT,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX people_name_nocase_idx
        ON people(name COLLATE NOCASE);

      CREATE TABLE loans (
        id TEXT PRIMARY KEY NOT NULL,
        person_id TEXT NOT NULL,
        amount_in_cents INTEGER NOT NULL CHECK (
          typeof(amount_in_cents) = 'integer' AND amount_in_cents > 0
        ),
        description TEXT,
        date TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'paid')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
      );

      CREATE INDEX loans_person_id_idx ON loans(person_id);
      CREATE INDEX loans_status_idx ON loans(status);
      CREATE INDEX loans_date_idx ON loans(date);

      CREATE TABLE payments (
        id TEXT PRIMARY KEY NOT NULL,
        loan_id TEXT NOT NULL,
        amount_in_cents INTEGER NOT NULL CHECK (
          typeof(amount_in_cents) = 'integer' AND amount_in_cents > 0
        ),
        date TEXT NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
      );

      CREATE INDEX payments_loan_id_idx ON payments(loan_id);
      CREATE INDEX payments_date_idx ON payments(date);
    `)
  },
} as const
