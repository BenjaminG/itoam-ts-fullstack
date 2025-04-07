import { seed, reset } from 'drizzle-seed'
import { createClient } from '../src/client.js'
import { users } from '../src/schema.js'

const balances = [0, 10000, 100000, 1000000]

const client = createClient()

await reset(client, { users })

await seed(client, { users }, { count: 10 }).refine((f) => ({
  users: {
    columns: {
      id: f.uuid(),
      email: f.email(),
      password: f.string({ isUnique: true }),
      balance: f.valuesFromArray({ values: balances }),
      createdAt: f.date({ maxDate: new Date() }),
    },
  },
}))

await client.$client.end()
