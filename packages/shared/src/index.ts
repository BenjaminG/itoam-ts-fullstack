import { Decimal } from 'decimal.js'

const SATOSHI = 100000000

export const btcToSats = (btcAmount: number): number =>
  Decimal.mul(btcAmount, SATOSHI).round().toNumber()

export const satsToBtc = (satsAmount: number): number =>
  Decimal.div(satsAmount, SATOSHI).toDecimalPlaces(8).toNumber()

export const usdToBtc = (usdAmount: number, btcPrice: number): number =>
  Decimal.div(usdAmount, btcPrice).mul(SATOSHI).round().div(SATOSHI).toNumber()
