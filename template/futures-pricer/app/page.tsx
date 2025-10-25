"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

type Order = {
  id: string
  side: "b" | "s"
  quantity: number
  leverage: number
  entryPrice: number
  margin: number
  liquidationPrice: number
  timestamp: Date
}

export default function FuturesPricer() {
  const [side, setSide] = useState<"b" | "s">("b")
  const [quantity, setQuantity] = useState<string>("")
  const [leverage, setLeverage] = useState<string>("")
  const [entryPrice, setEntryPrice] = useState<string>("")
  const [orders, setOrders] = useState<Order[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mock calculation functions (UI only)
  const calculateMargin = (qty: number, lev: number, price: number): number => {
    // Simplified margin calculation for UI demo
    return Math.round(((qty / price) * 100000000) / lev)
  }

  const calculateLiquidationPrice = (side: "b" | "s", price: number, lev: number): number => {
    // Simplified liquidation price calculation for UI demo
    const percentage = 1 / lev
    if (side === "b") {
      return Math.round(price * (1 - percentage) * 2) / 2
    } else {
      return Math.round(price * (1 + percentage) * 2) / 2
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!side) {
      newErrors.side = "Side is required"
    }

    const qtyNum = Number.parseInt(quantity)
    if (!quantity || isNaN(qtyNum) || qtyNum < 1 || qtyNum > 500000) {
      newErrors.quantity = "Quantity must be between 1 and 500,000 USD"
    }

    const levNum = Number.parseInt(leverage)
    if (!leverage || isNaN(levNum) || levNum < 1 || levNum > 100) {
      newErrors.leverage = "Leverage must be between 1 and 100"
    }

    const priceNum = Number.parseFloat(entryPrice)
    if (!entryPrice || isNaN(priceNum) || priceNum <= 0) {
      newErrors.entryPrice = "Entry price must be a positive number"
    } else if (priceNum % 0.5 !== 0) {
      newErrors.entryPrice = "Entry price must be in increments of 0.5"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const qtyNum = Number.parseInt(quantity)
    const levNum = Number.parseInt(leverage)
    const priceNum = Number.parseFloat(entryPrice)

    const margin = calculateMargin(qtyNum, levNum, priceNum)
    const liquidationPrice = calculateLiquidationPrice(side, priceNum, levNum)

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      side,
      quantity: qtyNum,
      leverage: levNum,
      entryPrice: priceNum,
      margin,
      liquidationPrice,
      timestamp: new Date(),
    }

    setOrders([newOrder, ...orders])

    // Reset form
    setQuantity("")
    setLeverage("")
    setEntryPrice("")
    setErrors({})
  }

  const calculatedMargin =
    quantity && leverage && entryPrice && !errors.quantity && !errors.leverage && !errors.entryPrice
      ? calculateMargin(Number.parseInt(quantity), Number.parseInt(leverage), Number.parseFloat(entryPrice))
      : null

  const calculatedLiquidationPrice =
    side && entryPrice && leverage && !errors.entryPrice && !errors.leverage
      ? calculateLiquidationPrice(side, Number.parseFloat(entryPrice), Number.parseInt(leverage))
      : null

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-white mb-3 text-balance tracking-tight font-[family-name:var(--font-heading)]">
            Futures Pricer
          </h1>
          <p className="text-zinc-400 text-lg">
            Calculate margin requirements and liquidation prices for inverse futures contracts
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Card className="border-zinc-800 bg-[#13131a] shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-white font-[family-name:var(--font-heading)]">
                Trade Parameters
              </CardTitle>
              <CardDescription className="text-zinc-400">Configure your position details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-zinc-300">Position Side</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSide("b")}
                      className={`h-14 rounded-lg font-semibold text-base transition-all ${
                        side === "b"
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Long / Buy</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("s")}
                      className={`h-14 rounded-lg font-semibold text-base transition-all ${
                        side === "s"
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                          : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <TrendingDown className="w-5 h-5" />
                        <span>Short / Sell</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="quantity" className="text-sm font-medium text-zinc-300">
                    Quantity
                  </Label>
                  <div className="relative">
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter amount"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-14 text-base bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 pr-16"
                      min="1"
                      max="500000"
                      step="1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">USD</span>
                  </div>
                  {errors.quantity && (
                    <div className="flex items-center gap-2 text-rose-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.quantity}</span>
                    </div>
                  )}
                  <p className="text-xs text-zinc-500">Range: 1 - 500,000 USD</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="leverage" className="text-sm font-medium text-zinc-300">
                    Leverage
                  </Label>
                  <div className="relative">
                    <Input
                      id="leverage"
                      type="number"
                      placeholder="Enter leverage"
                      value={leverage}
                      onChange={(e) => setLeverage(e.target.value)}
                      className="h-14 text-base bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 pr-12"
                      min="1"
                      max="100"
                      step="1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">x</span>
                  </div>
                  {errors.leverage && (
                    <div className="flex items-center gap-2 text-rose-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.leverage}</span>
                    </div>
                  )}
                  <p className="text-xs text-zinc-500">Range: 1x - 100x</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="entryPrice" className="text-sm font-medium text-zinc-300">
                    Entry Price
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                    <Input
                      id="entryPrice"
                      type="number"
                      placeholder="0.00"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="h-14 text-base bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 pl-8"
                      step="0.5"
                      min="0.5"
                    />
                  </div>
                  {errors.entryPrice && (
                    <div className="flex items-center gap-2 text-rose-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.entryPrice}</span>
                    </div>
                  )}
                  <p className="text-xs text-zinc-500">Increments of 0.5 USD</p>
                </div>

                {(calculatedMargin !== null || calculatedLiquidationPrice !== null) && (
                  <div className="p-6 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-4">
                    <h3 className="font-semibold text-white text-sm uppercase tracking-wider font-[family-name:var(--font-heading)]">
                      Live Calculation
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {calculatedMargin !== null && (
                        <div>
                          <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Margin Required</p>
                          <p className="text-3xl font-bold text-white font-mono">{calculatedMargin.toLocaleString()}</p>
                          <p className="text-sm text-zinc-400 mt-1">sats</p>
                        </div>
                      )}
                      {calculatedLiquidationPrice !== null && (
                        <div>
                          <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Liquidation Price</p>
                          <p className="text-3xl font-bold text-white font-mono">
                            ${calculatedLiquidationPrice.toLocaleString()}
                          </p>
                          <p className="text-sm text-zinc-400 mt-1">USD</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all"
                  size="lg"
                >
                  Create Order
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#13131a] shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-white font-[family-name:var(--font-heading)]">
                Order History
              </CardTitle>
              <CardDescription className="text-zinc-400">Track all submitted positions</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-zinc-600"
                    >
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white font-[family-name:var(--font-heading)]">
                    No orders yet
                  </h3>
                  <p className="text-sm text-zinc-500 max-w-sm">
                    Create your first order to see it appear here with all calculated parameters
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400 font-semibold">Side</TableHead>
                        <TableHead className="text-right text-zinc-400 font-semibold">Quantity</TableHead>
                        <TableHead className="text-right text-zinc-400 font-semibold">Leverage</TableHead>
                        <TableHead className="text-right text-zinc-400 font-semibold">Entry</TableHead>
                        <TableHead className="text-right text-zinc-400 font-semibold">Margin</TableHead>
                        <TableHead className="text-right text-zinc-400 font-semibold">Liquidation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-900/30">
                          <TableCell>
                            <Badge
                              className={
                                order.side === "b"
                                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30 font-semibold"
                                  : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-rose-500/30 font-semibold"
                              }
                            >
                              {order.side === "b" ? "LONG" : "SHORT"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-white">
                            ${order.quantity.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-white">{order.leverage}x</TableCell>
                          <TableCell className="text-right font-mono text-white">
                            ${order.entryPrice.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-emerald-400">
                            {order.margin.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-rose-400">
                            ${order.liquidationPrice.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
