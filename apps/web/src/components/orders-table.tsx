import React from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { NumericFormat } from 'react-number-format'
import { satsToBtc } from '@itoam/shared'
import { trpc } from '@/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BarChart3, Loader2, TrendingUp, TrendingDown } from 'lucide-react'

export function OrdersTable() {
  const { ref: loadMoreRef, inView } = useInView()
  const [sideFilter, setSideFilter] = React.useState<'all' | 'b' | 's'>('all')

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery(
    trpc.orders.list.infiniteQueryOptions(
      {
        limit: 20,
        side: sideFilter === 'all' ? undefined : sideFilter,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  )

  // Auto-fetch next page when user scrolls to bottom
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten all orders from all pages
  const allOrders = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.orders) ?? []
  }, [data])

  if (isPending) {
    return (
      <Card className="bg-card border-0 p-6">
        <h2 className="text-foreground mb-4 text-2xl font-bold">
          Order History
        </h2>
        <p className="text-muted-foreground text-center">Loading orders...</p>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="bg-card border-0 p-6">
        <h2 className="text-foreground mb-4 text-2xl font-bold">
          Order History
        </h2>
        <p className="text-destructive text-center">
          Error loading orders: {error.message || 'Unknown error'}
        </p>
      </Card>
    )
  }

  return (
    <Card className="bg-card flex flex-col border-0 p-6 lg:h-[870px]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-2xl font-bold">Order History</h2>
        <ToggleGroup
          type="single"
          value={sideFilter}
          onValueChange={(value) => {
            if (value) {
              setSideFilter(value as 'all' | 'b' | 's')
            }
          }}
          className="bg-background rounded-md p-1"
        >
          <ToggleGroupItem
            value="all"
            aria-label="All Orders"
            className="data-[state=on]:bg-muted data-[state=on]:text-foreground"
          >
            All Orders
          </ToggleGroupItem>
          <ToggleGroupItem
            value="b"
            aria-label="Long Orders"
            className="data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-300"
          >
            <TrendingUp className="mr-1.5 h-4 w-4" />
            Long
          </ToggleGroupItem>
          <ToggleGroupItem
            value="s"
            aria-label="Short Orders"
            className="data-[state=on]:bg-rose-500/20 data-[state=on]:text-rose-300"
          >
            <TrendingDown className="mr-1.5 h-4 w-4" />
            Short
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {allOrders.length === 0 ? (
        <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-lg border py-12">
          <BarChart3 className="text-muted-foreground mb-3 h-8 w-8" />
          <p className="text-muted-foreground text-center">No orders yet</p>
          <p className="text-muted-foreground/70 text-center text-xs">
            Create your first order to see it appear here with all calculated
            parameters
          </p>
        </div>
      ) : (
        <div className="relative min-h-0 flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full">
            <thead className="bg-card sticky top-0 z-10">
              <tr className="border-border border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Date & Time
                </th>
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
              {allOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-mono text-sm">
                      <div className="text-foreground">
                        {new Intl.DateTimeFormat('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }).format(new Date(order.createdAt))}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {new Intl.DateTimeFormat('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        }).format(new Date(order.createdAt))}
                      </div>
                    </div>
                  </td>
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

          {/* Load more sentinel */}
          <div
            ref={loadMoreRef}
            className="flex items-center justify-center py-6"
          >
            {isFetchingNextPage && (
              <div className="flex items-center gap-2">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                <p className="text-muted-foreground text-sm">Loading more...</p>
              </div>
            )}
            {!hasNextPage && allOrders.length > 0 && (
              <p className="text-muted-foreground text-sm">No more orders</p>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
