import { seed, reset } from 'drizzle-seed'
import { createClient } from '../src/client.js'
import { users, orders } from '../src/schema.js'
import { calculateMargin, calculateLiquidationPrice } from '@itoam/shared'

const balances = [0, 10000, 100000, 1000000]

const client = createClient()

await reset(client, { users, orders })

// Seed users
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

// Generate 100 orders with proper calculations
const ordersToInsert = []

// Helper function to generate random value
const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

// Helper function to round to nearest 0.5
const roundToHalf = (n: number): number => Math.round(n * 2) / 2

for (let i = 0; i < 100; i++) {
  const side = Math.random() > 0.5 ? ('b' as const) : ('s' as const)
  const quantity = randomInt(1, 500000)
  let leverage = randomInt(1, 100)

  // Avoid short positions with leverage=1 (would cause division by zero)
  if (side === 's' && leverage === 1) {
    leverage = 2
  }

  // Entry price: $40k to $110k range with 0.5 step
  const entryPrice = roundToHalf(randomInt(80000, 220000) / 2)

  // Calculate margin in satoshis
  const margin = calculateMargin(quantity, entryPrice, leverage)

  // Calculate liquidation price
  const liquidationPrice = calculateLiquidationPrice(
    side,
    entryPrice,
    margin,
    quantity
  )

  // Random creation date in the past 30 days
  const daysAgo = randomInt(0, 30)
  const createdAt = new Date()
  createdAt.setDate(createdAt.getDate() - daysAgo)

  ordersToInsert.push({
    side,
    quantity: quantity.toString(),
    leverage: leverage.toString(),
    entryPrice: entryPrice.toString(),
    margin,
    liquidationPrice: liquidationPrice.toString(),
    createdAt,
  })
}

// Insert all orders at once
await client.insert(orders).values(ordersToInsert)

await client.$client.end()
