import { createTRPCClient, httpLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { ApiRouter } from '@itoam/trpc-api'
import { QueryClient } from '@tanstack/react-query'
import superJSON from 'superjson'

export const queryClient = new QueryClient()

export const trpc = createTRPCOptionsProxy<ApiRouter>({
  queryClient,
  client: createTRPCClient<ApiRouter>({
    links: [
      httpLink({
        url: `http://localhost:3000/trpc`,
        transformer: superJSON,
      }),
    ],
  }),
})
