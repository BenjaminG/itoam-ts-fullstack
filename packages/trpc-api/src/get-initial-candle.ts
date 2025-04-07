// Do not change this file

import { createTRPCUntypedClient, httpLink } from '@trpc/client'
import superJSON from 'superjson'
import type { OHLC, Timeframe } from '@itoam/types'

const RESOLUTION_MAP: Record<Timeframe, string> = {
  '1m': '1',
  '5m': '5',
  '15m': '15',
  '1h': '60',
  '4h': '240',
  '1d': '1D',
}

const ONE_MINUTE = 1000 * 60
const ONE_DAY = ONE_MINUTE * 60 * 24

type GetInitialCandle = (args: { timeframe: Timeframe }) => Promise<OHLC>

export const getInitialCandle: GetInitialCandle = async ({ timeframe }) => {
  const lnmTRPCClient = createTRPCUntypedClient({
    links: [
      httpLink({
        url: `https://api.lnmarkets.com/trpc`,
        transformer: superJSON,
      }),
    ],
  })

  const lnmRange = RESOLUTION_MAP[timeframe]

  const [candle] = (await lnmTRPCClient.query('ohlc.get', {
    from:
      lnmRange === '1D'
        ? new Date(Date.now() - ONE_DAY - 1)
        : new Date(Date.now() - ONE_MINUTE * Number(lnmRange) - 1),
    to: new Date(),
    range: RESOLUTION_MAP[timeframe],
    countBack: 0,
  })) as OHLC[]

  if (!candle) {
    throw new Error(
      'Unexpected error: could not get initial candle from LN Markets'
    )
  }

  return candle
}
