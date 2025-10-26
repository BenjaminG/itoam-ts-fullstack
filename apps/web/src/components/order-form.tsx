import { useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { NumericFormat } from 'react-number-format'
import { trpc, queryClient } from '@/utils'
import { Button } from '@itoam/ui'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  calculateMargin,
  calculateLiquidationPrice,
  satsToBtc,
} from '@itoam/shared'

export function OrderForm() {
  const [formData, setFormData] = useState({
    side: 'b' as 'b' | 's',
    quantity: '',
    leverage: '1',
    entryPrice: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createOrderMutation = useMutation(
    trpc.createOrder.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.getOrders.queryFilter())
        // Reset form
        setFormData({
          side: 'b',
          quantity: '',
          leverage: '1',
          entryPrice: '',
        })
        setErrors({})
      },
    })
  )

  // Calculate margin and liquidation price
  const calculations = useMemo(() => {
    const qty = parseFloat(formData.quantity)
    const lev = parseFloat(formData.leverage)
    const price = parseFloat(formData.entryPrice)

    if (!qty || !lev || !price || qty <= 0 || lev <= 0 || price <= 0) {
      return null
    }

    const margin = calculateMargin(qty, price, lev)
    const liquidationPrice = calculateLiquidationPrice(
      formData.side,
      price,
      margin,
      qty
    )

    return {
      margin,
      marginBtc: satsToBtc(margin),
      liquidationPrice,
    }
  }, [formData.quantity, formData.leverage, formData.entryPrice, formData.side])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const qty = parseInt(formData.quantity, 10)
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required'
    } else if (!Number.isInteger(qty)) {
      newErrors.quantity = 'Quantity must be an integer'
    } else if (qty < 1) {
      newErrors.quantity = 'Quantity must be at least 1'
    } else if (qty > 500000) {
      newErrors.quantity = 'Quantity cannot exceed 500,000'
    }

    const lev = parseInt(formData.leverage, 10)
    if (!formData.leverage) {
      newErrors.leverage = 'Leverage is required'
    } else if (!Number.isInteger(lev)) {
      newErrors.leverage = 'Leverage must be an integer'
    } else if (lev < 1) {
      newErrors.leverage = 'Leverage must be at least 1'
    } else if (lev > 100) {
      newErrors.leverage = 'Leverage cannot exceed 100'
    }

    // Validate short position + 1x leverage edge case
    if (formData.side === 's' && lev === 1) {
      newErrors.leverage = 'Short positions require leverage of 2x or higher'
    }

    const price = parseFloat(formData.entryPrice)
    if (!formData.entryPrice) {
      newErrors.entryPrice = 'Entry price is required'
    } else if (price <= 0) {
      newErrors.entryPrice = 'Entry price must be positive'
    } else {
      const priceRounded = Math.round(price * 2) / 2
      if (Math.abs(priceRounded - price) > 0.001) {
        newErrors.entryPrice = 'Entry price must be rounded to nearest 0.5'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await createOrderMutation.mutateAsync({
        side: formData.side,
        quantity: parseInt(formData.quantity, 10),
        leverage: parseInt(formData.leverage, 10),
        entryPrice: parseFloat(formData.entryPrice),
      })
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message })
      }
    }
  }

  return (
    <Card className="bg-card border-0 p-6">
      <h2 className="text-foreground mb-2 text-2xl font-bold">
        Trade Parameters
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Side Selector */}
        <div>
          <label className="text-foreground mb-3 block text-sm font-semibold">
            Position Side
          </label>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setFormData({ ...formData, side: 'b' })}
              className={`h-14 flex-1 text-lg font-bold transition-all ${
                formData.side === 'b'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white shadow-emerald-500/40 hover:from-emerald-600 hover:to-emerald-500'
                  : 'bg-secondary text-foreground hover:bg-secondary/80 border-border border'
              }`}
            >
              <TrendingUp className="mr-2 inline h-5 w-5" />
              Long / Buy
            </Button>
            <Button
              type="button"
              onClick={() => setFormData({ ...formData, side: 's' })}
              className={`h-14 flex-1 text-lg font-bold transition-all ${
                formData.side === 's'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-500/40 hover:from-rose-600 hover:to-pink-600'
                  : 'bg-secondary text-foreground hover:bg-secondary/80 border-border border'
              }`}
            >
              <TrendingDown className="mr-2 inline h-5 w-5" />
              Short / Sell
            </Button>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label
            htmlFor="quantity"
            className="text-foreground mb-2 block text-sm font-semibold"
          >
            Quantity
          </label>
          <div className="relative">
            <NumericFormat
              id="quantity"
              thousandSeparator=","
              value={formData.quantity}
              onValueChange={(values) =>
                setFormData({ ...formData, quantity: values.value })
              }
              placeholder="Enter amount"
              className={`bg-muted border-border text-foreground placeholder:text-muted-foreground w-full rounded border px-3 py-2 ${
                errors.quantity ? 'border-destructive' : ''
              }`}
            />
            <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2">
              USD
            </span>
          </div>
          {errors.quantity && (
            <p className="text-destructive mt-1 text-xs">{errors.quantity}</p>
          )}
          <p className="text-muted-foreground mt-1 text-xs">
            Range: 1 - 500,000 USD
          </p>
        </div>

        {/* Leverage Input */}
        <div>
          <label
            htmlFor="leverage"
            className="text-foreground mb-2 block text-sm font-semibold"
          >
            Leverage
          </label>
          <div className="relative">
            <NumericFormat
              id="leverage"
              value={formData.leverage}
              onValueChange={(values) =>
                setFormData({ ...formData, leverage: values.value })
              }
              placeholder="Enter leverage"
              className={`bg-muted border-border text-foreground placeholder:text-muted-foreground w-full rounded border px-3 py-2 ${
                errors.leverage ? 'border-destructive' : ''
              }`}
            />
            <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2">
              x
            </span>
          </div>

          {/* Leverage Slider */}
          <div className="mt-4 space-y-3">
            <Slider
              value={[parseInt(formData.leverage) || 1]}
              onValueChange={(value) => {
                if (value[0] !== undefined) {
                  setFormData({ ...formData, leverage: value[0].toString() })
                }
              }}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-500">x1 · Safe</span>
              <span className="text-rose-500">Wild · x100</span>
            </div>
          </div>

          {errors.leverage && (
            <p className="text-destructive mt-1 text-xs">{errors.leverage}</p>
          )}
          <p className="text-muted-foreground mt-1 text-xs">Range: 1x - 100x</p>
        </div>

        {/* Entry Price Input */}
        <div>
          <label
            htmlFor="entryPrice"
            className="text-foreground mb-2 block text-sm font-semibold"
          >
            Entry Price
          </label>
          <div className="relative">
            <NumericFormat
              id="entryPrice"
              prefix="$"
              thousandSeparator=","
              decimalScale={2}
              fixedDecimalScale
              value={formData.entryPrice}
              onValueChange={(values) =>
                setFormData({ ...formData, entryPrice: values.value })
              }
              placeholder="$0.00"
              className={`bg-muted border-border text-foreground placeholder:text-muted-foreground w-full rounded border px-3 py-2 ${
                errors.entryPrice ? 'border-destructive' : ''
              }`}
            />
          </div>
          {errors.entryPrice && (
            <p className="text-destructive mt-1 text-xs">{errors.entryPrice}</p>
          )}
          <p className="text-muted-foreground mt-1 text-xs">
            Increments of 0.5 USD
          </p>
        </div>

        {/* Live Calculation Display */}
        {calculations && (
          <div className="border-border from-muted/80 to-muted/40 space-y-3 rounded-lg border bg-gradient-to-br p-6">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
              Live Calculation
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground mb-1 text-[10px] font-medium tracking-wide">
                  Margin Required
                </p>
                <p className="text-primary font-mono text-xl font-bold tracking-normal tabular-nums">
                  {calculations.margin.toLocaleString()}
                </p>
                <p className="text-muted-foreground mt-1 text-[10px]">
                  {calculations.marginBtc.toFixed(8)} BTC
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-[10px] font-medium tracking-wide">
                  Liquidation Price
                </p>
                <p className="text-primary font-mono text-xl font-bold tracking-normal tabular-nums">
                  ${calculations.liquidationPrice.toFixed(1)}
                </p>
                <p className="text-muted-foreground mt-1 text-[10px]">USD</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errors.submit && (
          <div className="border-destructive bg-destructive/10 rounded-lg border p-3">
            <p className="text-destructive text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={createOrderMutation.isPending}
          className="disabled:bg-muted disabled:text-muted-foreground w-full bg-gradient-to-r from-emerald-500 to-emerald-400 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-500 disabled:shadow-none"
        >
          {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
        </Button>
      </form>
    </Card>
  )
}
