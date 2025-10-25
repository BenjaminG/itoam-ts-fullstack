import { useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { trpc, queryClient } from '@/utils'
import { Button, Input } from '@itoam/ui'
import { Card } from '@/components/ui/card'
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
    leverage: '',
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
          leverage: '',
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
    <Card className="border-0 bg-card p-6">
      <h2 className="mb-2 text-2xl font-bold text-foreground">Trade Parameters</h2>
      <p className="mb-6 text-sm text-muted-foreground">Configure your position details</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Side Selector */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-foreground">
            Position Side
          </label>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setFormData({ ...formData, side: 'b' })}
              className={`flex-1 h-10 transition-all ${
                formData.side === 'b'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                  : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
              }`}
            >
              <TrendingUp className="mr-2 inline h-4 w-4" />
              Long / Buy
            </Button>
            <Button
              type="button"
              onClick={() => setFormData({ ...formData, side: 's' })}
              className={`flex-1 h-10 transition-all ${
                formData.side === 's'
                  ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30'
                  : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
              }`}
            >
              <TrendingDown className="mr-2 inline h-4 w-4" />
              Short / Sell
            </Button>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label
            htmlFor="quantity"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Quantity
          </label>
          <div className="relative">
            <Input
              id="quantity"
              type="number"
              min="1"
              max="500000"
              step="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="Enter amount"
              className={`w-full bg-muted border-border text-foreground placeholder:text-muted-foreground ${
                errors.quantity ? 'border-destructive' : ''
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">USD</span>
          </div>
          {errors.quantity && (
            <p className="mt-1 text-xs text-destructive">{errors.quantity}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Range: 1 - 500,000 USD</p>
        </div>

        {/* Leverage Input */}
        <div>
          <label
            htmlFor="leverage"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Leverage
          </label>
          <div className="relative">
            <Input
              id="leverage"
              type="number"
              min="1"
              max="100"
              step="1"
              value={formData.leverage}
              onChange={(e) =>
                setFormData({ ...formData, leverage: e.target.value })
              }
              placeholder="Enter leverage"
              className={`w-full bg-muted border-border text-foreground placeholder:text-muted-foreground ${
                errors.leverage ? 'border-destructive' : ''
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">x</span>
          </div>
          {errors.leverage && (
            <p className="mt-1 text-xs text-destructive">{errors.leverage}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Range: 1x - 100x</p>
        </div>

        {/* Entry Price Input */}
        <div>
          <label
            htmlFor="entryPrice"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Entry Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="entryPrice"
              type="number"
              step="0.5"
              value={formData.entryPrice}
              onChange={(e) =>
                setFormData({ ...formData, entryPrice: e.target.value })
              }
              placeholder="0.00"
              className={`w-full bg-muted border-border pl-7 text-foreground placeholder:text-muted-foreground ${
                errors.entryPrice ? 'border-destructive' : ''
              }`}
            />
          </div>
          {errors.entryPrice && (
            <p className="mt-1 text-xs text-destructive">{errors.entryPrice}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Increments of 0.5 USD</p>
        </div>

        {/* Live Calculation Display */}
        {calculations && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Live Calculation
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Margin Required</p>
                <p className="font-mono text-lg font-bold text-primary">
                  {calculations.margin.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {calculations.marginBtc.toFixed(8)} BTC
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Liquidation Price</p>
                <p className="font-mono text-lg font-bold text-primary">
                  ${calculations.liquidationPrice.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">USD</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errors.submit && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={createOrderMutation.isPending}
          className="w-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-muted disabled:text-muted-foreground"
        >
          {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
        </Button>
      </form>
    </Card>
  )
}
