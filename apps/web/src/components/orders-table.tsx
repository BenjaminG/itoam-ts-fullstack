import { useQuery } from '@tanstack/react-query'
import { NumericFormat } from 'react-number-format'
import { trpc } from '@/utils'
import { satsToBtc } from '@itoam/shared'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3 } from 'lucide-react'

export function OrdersTable() {
  const { data: ordersData, isLoading } = useQuery({
    ...trpc.getOrders.queryOptions(),
    refetchInterval: 5000,
  })

  const orders = ordersData ?? []

  if (isLoading) {
    return (
      <Card className="bg-card border-0 p-6">
        <h2 className="text-foreground mb-4 text-2xl font-bold">
          Order History
        </h2>
        <p className="text-muted-foreground text-center">Loading orders...</p>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-0 p-6">
      <h2 className="text-foreground mb-2 text-2xl font-bold">Order History</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Track all submitted positions
      </p>

      {orders.length === 0 ? (
        <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-lg border py-12">
          <BarChart3 className="text-muted-foreground mb-3 h-8 w-8" />
          <p className="text-muted-foreground text-center">No orders yet</p>
          <p className="text-muted-foreground/70 text-center text-xs">
            Create your first order to see it appear here with all calculated
            parameters
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Side
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Quantity
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Leverage
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Entry
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Margin
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Liquidation
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge
                      className={
                        order.side === 'b'
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      }
                    >
                      {order.side === 'b' ? 'LONG' : 'SHORT'}
                    </Badge>
                  </td>
                  <td className="text-foreground px-4 py-4 font-mono text-sm whitespace-nowrap">
                    <NumericFormat
                      displayType="text"
                      prefix="$"
                      thousandSeparator=","
                      value={parseFloat(order.quantity)}
                    />
                  </td>
                  <td className="text-foreground px-4 py-4 font-mono text-sm whitespace-nowrap">
                    <NumericFormat
                      displayType="text"
                      suffix="x"
                      value={parseFloat(order.leverage)}
                      decimalScale={0}
                    />
                  </td>
                  <td className="text-foreground px-4 py-4 font-mono text-sm whitespace-nowrap">
                    <NumericFormat
                      displayType="text"
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={1}
                      fixedDecimalScale
                      value={parseFloat(order.entryPrice)}
                    />
                  </td>
                  <td className="px-4 py-4 font-mono text-sm whitespace-nowrap">
                    <div className="text-primary">
                      <NumericFormat
                        displayType="text"
                        thousandSeparator=","
                        value={order.margin}
                      />
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {satsToBtc(order.margin).toFixed(8)} BTC
                    </div>
                  </td>
                  <td className="text-foreground px-4 py-4 font-mono text-sm whitespace-nowrap">
                    <NumericFormat
                      displayType="text"
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={1}
                      fixedDecimalScale
                      value={parseFloat(order.liquidationPrice)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
