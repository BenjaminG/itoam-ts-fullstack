import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import process from 'node:process'

export const createClient = () => {
  return drizzle(
    postgres(
      process.env.DATABASE_URL ??
        'postgresql://postgres:postgres@localhost:5432/postgres'
    )
  )
}
