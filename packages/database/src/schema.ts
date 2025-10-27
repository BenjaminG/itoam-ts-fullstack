import { sql } from 'drizzle-orm'
import {
  text,
  varchar,
  pgTable,
  bigint,
  timestamp,
  char,
  numeric,
} from 'drizzle-orm/pg-core'

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

export const orders = pgTable('orders', {
  id: text('id')
    .default(sql<string>`uuid_generate_v4 ()`)
    .primaryKey()
    .notNull(),
  side: char('side', { length: 1 }).notNull(), // 'b' for buy, 's' for sell
  quantity: numeric('quantity').notNull(), // USD amount
  leverage: numeric('leverage').notNull(), // leverage multiplier
  entryPrice: numeric('entry_price').notNull(), // entry price in USD
  margin: bigint('margin', { mode: 'number' }).notNull(), // margin in satoshis
  liquidationPrice: numeric('liquidation_price').notNull(), // liquidation price in USD
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
