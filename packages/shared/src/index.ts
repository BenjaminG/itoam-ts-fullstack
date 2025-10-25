import { Decimal } from 'decimal.js'

const SATOSHI = 100000000

export const btcToSats = (btcAmount: number): number =>
  Decimal.mul(btcAmount, SATOSHI).round().toNumber()

export const satsToBtc = (satsAmount: number): number =>
  Decimal.div(satsAmount, SATOSHI).toDecimalPlaces(8).toNumber()

export const usdToBtc = (usdAmount: number, btcPrice: number): number =>
  Decimal.div(usdAmount, btcPrice).mul(SATOSHI).round().div(SATOSHI).toNumber()

/**
 * Calculate the margin required for a futures position in satoshis
 * Formula: Margin = Quantity / (Price × Leverage)
 * Result is in satoshis, rounded to nearest integer
 */
export const calculateMargin = (
  quantityUsd: number,
  priceUsd: number,
  leverage: number
): number => {
  const marginBtc = Decimal.div(quantityUsd, Decimal.mul(priceUsd, leverage))
  const marginSats = Decimal.mul(marginBtc, SATOSHI).round()
  return marginSats.toNumber()
}

/**
 * Calculate the liquidation price for a futures position
 * Formula for Long: 1 / (1/EntryPrice + Margin/Quantity)
 * Formula for Short: 1 / (1/EntryPrice - Margin/Quantity)
 * Result is in USD, rounded to nearest 0.5
 */
export const calculateLiquidationPrice = (
  side: 'b' | 's',
  entryPriceUsd: number,
  marginSats: number,
  quantityUsd: number
): number => {
  const marginBtc = Decimal.div(marginSats, SATOSHI)
  const marginQtyRatio = Decimal.div(marginBtc, quantityUsd)
  const invEntryPrice = Decimal.div(1, entryPriceUsd)

  let denominator: Decimal
  if (side === 'b') {
    // Long position
    denominator = Decimal.add(invEntryPrice, marginQtyRatio)
  } else {
    // Short position
    denominator = Decimal.sub(invEntryPrice, marginQtyRatio)
  }

  const liquidationPrice = Decimal.div(1, denominator)

  // Round to nearest 0.5
  const rounded = liquidationPrice.mul(2).round().div(2)
  return rounded.toNumber()
}
