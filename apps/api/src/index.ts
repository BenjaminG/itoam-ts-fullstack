import { pathToFileURL } from 'node:url'

import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { router, createTRPCContext, getInitialCandle } from '@itoam/trpc-api'
import Fastify from 'fastify'
import { createClient } from '@itoam/database/client'
import cors from '@fastify/cors'
import { createEventEmitter } from './events.js'

const createServer = async () => {
  const db = createClient()
  const events = createEventEmitter()

  await getInitialCandle({ timeframe: '1d' })

  const fastify = Fastify({
    routerOptions: { maxParamLength: 5000 },
    bodyLimit: Math.pow(2, 24),
    requestIdLogLabel: 'requestId',
    logger: {
      level: 'debug',
    },
  })

  await fastify.register(cors, {
    origin: '*',
  })

  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router,
      createContext: createTRPCContext({ db, events }),
    },
  })

  return fastify
}

const start = async () => {
  const instance = await createServer()
  await instance.listen({ host: '0.0.0.0', port: 3000 })

  return async () => {
    await instance.close()
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await start()
}
