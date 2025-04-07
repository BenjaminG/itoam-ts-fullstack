import { initTRPC } from '@trpc/server'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import superJSON from 'superjson'
import type { EventEmitter } from 'node:events'
import type { ApiEvents } from '@itoam/types'

interface Dependencies {
  db: PostgresJsDatabase
  events: EventEmitter<ApiEvents>
}

interface Context {
  req: CreateFastifyContextOptions['req']
  db: PostgresJsDatabase
  events: EventEmitter<ApiEvents>
}

export const createTRPCContext =
  (deps: Dependencies) =>
  ({ req }: CreateFastifyContextOptions) => ({ req, ...deps })

const t = initTRPC.context<Context>().create({ transformer: superJSON })

export const createTRPCRouter = t.router
export const createProcedure = t.procedure
