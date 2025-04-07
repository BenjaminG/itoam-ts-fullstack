import { createTRPCUntypedClient, wsLink, createWSClient } from '@trpc/client'
import { EventEmitter } from 'node:events'
import superJSON from 'superjson'
import type { ApiEvents, OHLC } from '@itoam/types'

export const createEventEmitter = () => {
  const emitter = new EventEmitter<ApiEvents>()

  const lnmTRPCClient = createTRPCUntypedClient({
    links: [
      wsLink({
        client: createWSClient({ url: 'wss://api.lnmarkets.com/ws' }),
        transformer: superJSON,
      }),
    ],
  })

  lnmTRPCClient.subscription(
    'ohlc',
    {
      resolution: '1',
    },
    {
      onError: (error) => {
        console.error('Error subscribing to LN Markets OHLC updates', error)
      },
      onData: (data) => {
        emitter.emit('ohlc/1m', data as OHLC)
      },
    }
  )

  return emitter
}
