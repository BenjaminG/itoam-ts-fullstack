import { useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { trpc, queryClient } from '@/utils'
import { Button, Input } from '@itoam/ui'
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

    const qty = parseFloat(formData.quantity)
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required'
    } else if (qty < 1) {
      newErrors.quantity = 'Quantity must be at least 1'
    } else if (qty > 500000) {
      newErrors.quantity = 'Quantity cannot exceed 500,000'
    }

    const lev = parseFloat(formData.leverage)
    if (!formData.leverage) {
      newErrors.leverage = 'Leverage is required'
    } else if (lev < 1) {
      newErrors.leverage = 'Leverage must be at least 1'
    } else if (lev > 100) {
      newErrors.leverage = 'Leverage cannot exceed 100'
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
        quantity: parseFloat(formData.quantity),
        leverage: parseFloat(formData.leverage),
        entryPrice: parseFloat(formData.entryPrice),
      })
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message })
      }
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Create New Order
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Side Selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Position Side
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setFormData({ ...formData, side: 'b' })}
              className={`flex-1 ${
                formData.side === 'b'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Buy (Long)
            </Button>
            <Button
              type="button"
              onClick={() => setFormData({ ...formData, side: 's' })}
              className={`flex-1 ${
                formData.side === 's'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sell (Short)
            </Button>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label
            htmlFor="quantity"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Quantity (USD) <span className="text-gray-500">1 - 500,000</span>
          </label>
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
            placeholder="Enter quantity in USD"
            className="w-full"
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>

        {/* Leverage Input */}
        <div>
          <label
            htmlFor="leverage"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Leverage <span className="text-gray-500">1 - 100x</span>
          </label>
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
            placeholder="Enter leverage multiplier"
            className="w-full"
          />
          {errors.leverage && (
            <p className="mt-1 text-sm text-red-600">{errors.leverage}</p>
          )}
        </div>

        {/* Entry Price Input */}
        <div>
          <label
            htmlFor="entryPrice"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Entry Price (USD) <span className="text-gray-500">step: 0.5</span>
          </label>
          <Input
            id="entryPrice"
            type="number"
            step="0.5"
            value={formData.entryPrice}
            onChange={(e) =>
              setFormData({ ...formData, entryPrice: e.target.value })
            }
            placeholder="Enter entry price in USD"
            className="w-full"
          />
          {errors.entryPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.entryPrice}</p>
          )}
        </div>

        {/* Calculations Display */}
        {calculations && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Margin</p>
                <p className="font-mono text-lg font-semibold text-gray-900">
                  {calculations.margin.toLocaleString()} sats
                </p>
                <p className="text-xs text-gray-500">
                  ({calculations.marginBtc.toFixed(8)} BTC)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Liquidation Price</p>
                <p className="font-mono text-lg font-semibold text-gray-900">
                  ${calculations.liquidationPrice.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errors.submit && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={createOrderMutation.isPending}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
        </Button>
      </form>
    </div>
  )
}
