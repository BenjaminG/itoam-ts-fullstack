import { useQuery } from '@tanstack/react-query'
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
      <Card className="border-0 bg-card p-6">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Order History</h2>
        <p className="text-center text-muted-foreground">Loading orders...</p>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-card p-6">
      <h2 className="mb-2 text-2xl font-bold text-foreground">Order History</h2>
      <p className="mb-6 text-sm text-muted-foreground">Track all submitted positions</p>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 py-12">
          <BarChart3 className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-center text-muted-foreground">No orders yet</p>
          <p className="text-center text-xs text-muted-foreground/70">
            Create your first order to see it appear here with all calculated parameters
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Side
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Leverage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Entry
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Margin
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Liquidation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-muted/50"
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
                  <td className="px-4 py-4 font-mono text-sm whitespace-nowrap text-foreground">
                    ${parseFloat(order.quantity).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 font-mono text-sm whitespace-nowrap text-foreground">
                    {parseFloat(order.leverage).toFixed(0)}x
                  </td>
                  <td className="px-4 py-4 font-mono text-sm whitespace-nowrap text-foreground">
                    ${parseFloat(order.entryPrice).toFixed(1)}
                  </td>
                  <td className="px-4 py-4 font-mono text-sm whitespace-nowrap">
                    <div className="text-primary">
                      {order.margin.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {satsToBtc(order.margin).toFixed(8)} BTC
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm whitespace-nowrap text-foreground">
                    ${parseFloat(order.liquidationPrice).toFixed(1)}
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
