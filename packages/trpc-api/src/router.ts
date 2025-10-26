import { createTRPCRouter, createProcedure } from './trpc.js'
import { z } from 'zod/v4'
import { users, orders } from '@itoam/database/schema'
import { createSelectSchema } from 'drizzle-zod'
import { eq, desc, lt, and } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { calculateMargin, calculateLiquidationPrice } from '@itoam/shared'

const usersSelectSchema = createSelectSchema(users)
const ordersSelectSchema = createSelectSchema(orders)

const loggedProcedure = createProcedure
  .use(async ({ ctx, next, getRawInput, path, type }) => {
    const rawInput = await getRawInput()

    ctx.req.log.info({ path, type, data: rawInput })

    return next()
  })
  .use(async ({ ctx, next, path, type, getRawInput }) => {
    const result = await next()

    if (!result.ok) {
      const rawInput = await getRawInput()
      ctx.req.log.error({
        error: result.error,
        path,
        type,
        input: rawInput,
      })
    }

    return result
  })

const usersRouter = createTRPCRouter({
  list: loggedProcedure
    .output(z.array(usersSelectSchema.omit({ password: true })))
    .query(async ({ ctx }) => {
      return ctx.db
        .select({
          id: users.id,
          email: users.email,
          balance: users.balance,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
    }),
  updateEmail: loggedProcedure
    .input(z.object({ id: z.string(), email: z.string() }))
    .output(usersSelectSchema.omit({ password: true }))
    .mutation(async ({ ctx, input }) => {
      const isEmailUnique = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))

      if (isEmailUnique.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email is already in use',
        })
      }

      const [user] = await ctx.db
        .update(users)
        .set({ email: input.email })
        .where(eq(users.id, input.id))
        .returning({
          id: users.id,
          email: users.email,
          balance: users.balance,
          createdAt: users.createdAt,
        })

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      return user
    }),
})

const ordersRouter = createTRPCRouter({
  list: loggedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().nullish(),
        side: z.enum(['b', 's']).optional(),
      })
    )
    .output(
      z.object({
        orders: z.array(ordersSelectSchema),
        nextCursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit
      // Fetch limit + 1 to determine if there are more pages
      const fetchCount = limit + 1

      let cursorCreatedAt: Date | undefined

      // If cursor provided, fetch the cursor order to get its createdAt
      if (input.cursor) {
        const [cursorOrder] = await ctx.db
          .select({ createdAt: orders.createdAt })
          .from(orders)
          .where(eq(orders.id, input.cursor))

        if (cursorOrder) {
          cursorCreatedAt = cursorOrder.createdAt
        }
      }

      // Build conditions - filter by cursor and optionally by side
      const conditions = [
        cursorCreatedAt ? lt(orders.createdAt, cursorCreatedAt) : undefined,
        input.side ? eq(orders.side, input.side) : undefined,
      ].filter((c): c is NonNullable<typeof c> => c !== undefined)

      // Build query - fetch orders with optional filtering
      const results = await ctx.db
        .select()
        .from(orders)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(orders.createdAt))
        .limit(fetchCount)

      // If we got more than limit results, there are more pages
      const hasMore = results.length > limit
      const paginatedResults = hasMore ? results.slice(0, limit) : results
      const nextCursor = hasMore
        ? paginatedResults[paginatedResults.length - 1]?.id
        : undefined

      return {
        orders: paginatedResults,
        nextCursor,
      }
    }),
  create: loggedProcedure
    .input(
      z.object({
        side: z.enum(['b', 's']).describe('Buy (b) or Sell (s)'),
        quantity: z.coerce
          .number()
          .int('Quantity must be an integer')
          .min(1, 'Quantity must be at least 1')
          .max(500000, 'Quantity cannot exceed 500,000')
          .describe('Position size in USD'),
        leverage: z.coerce
          .number()
          .int('Leverage must be an integer')
          .min(1, 'Leverage must be at least 1')
          .max(100, 'Leverage cannot exceed 100')
          .describe('Leverage multiplier'),
        entryPrice: z.coerce
          .number()
          .positive('Entry price must be positive')
          .describe('Entry price in USD (step: 0.5)'),
      })
    )
    .output(ordersSelectSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate short position + 1x leverage edge case
      if (input.side === 's' && input.leverage === 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Short positions require leverage of 2x or higher',
        })
      }

      // Validate entry price step (0.5)
      const priceRounded = Math.round(input.entryPrice * 2) / 2
      if (Math.abs(priceRounded - input.entryPrice) > 0.001) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Entry price must be rounded to nearest 0.5',
        })
      }

      // Calculate margin and liquidation price
      const margin = calculateMargin(
        input.quantity,
        input.entryPrice,
        input.leverage
      )
      const liquidationPrice = calculateLiquidationPrice(
        input.side,
        input.entryPrice,
        margin,
        input.quantity
      )

      // Insert order into database
      const [order] = await ctx.db
        .insert(orders)
        .values({
          side: input.side,
          quantity: input.quantity.toString(),
          leverage: input.leverage.toString(),
          entryPrice: input.entryPrice.toString(),
          margin,
          liquidationPrice: liquidationPrice.toString(),
        })
        .returning()

      if (!order) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create order',
        })
      }

      return order
    }),
})

export const router = createTRPCRouter({
  users: usersRouter,
  orders: ordersRouter,
})

export type ApiRouter = typeof router
