import { createTRPCRouter, createProcedure } from './trpc.js'
import { z } from 'zod/v4'
import { users } from '@itoam/database/schema'
import { createSelectSchema } from 'drizzle-zod'
import { eq, desc } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

const usersSelectSchema = createSelectSchema(users)

const procedure = createProcedure
  .use(async ({ ctx, next, getRawInput, path, type }) => {
    const rawInput = await getRawInput()

    ctx.req.log.info({ path, type, data: rawInput })

    return next()
  })
  .use(async ({ ctx, next }) => {
    const result = await next()

    if (!result.ok) {
      ctx.req.log.error({ error: result.error })
    }

    return result
  })

export const router = createTRPCRouter({
  getUsers: procedure
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
  updateEmail: procedure
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

export type ApiRouter = typeof router
