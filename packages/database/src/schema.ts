import { sql } from 'drizzle-orm'
import { text, varchar, pgTable, bigint, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id')
    .default(sql<string>`uuid_generate_v4 ()`)
    .primaryKey()
    .notNull(),
  email: varchar('email', { length: 318 }).unique().notNull(),
  password: text('password').notNull(),
  balance: bigint('balance', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
