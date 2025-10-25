import { useQuery } from '@tanstack/react-query'
import { trpc } from '@/utils'
import { satsToBtc } from '@itoam/shared'

export function OrdersTable() {
  const { data: ordersData, isLoading } = useQuery(
    trpc.getOrders.queryOptions()
  )

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <p className="text-center text-gray-600">Loading orders...</p>
      </div>
    )
  }

  const orders = ordersData ?? []

  return (
    <div className="w-full rounded-lg border border-gray-300 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                Side
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                Quantity (USD)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                Leverage
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                Entry Price (USD)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                Margin (Sats)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                Liquidation Price (USD)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-600">
                  No orders yet. Create one using the form above.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        order.side === 'b'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.side === 'b' ? 'Buy' : 'Sell'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm whitespace-nowrap text-gray-900">
                    ${parseFloat(order.quantity).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm whitespace-nowrap text-gray-900">
                    {parseFloat(order.leverage).toFixed(1)}x
                  </td>
                  <td className="px-6 py-4 font-mono text-sm whitespace-nowrap text-gray-900">
                    ${parseFloat(order.entryPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm whitespace-nowrap text-gray-900">
                    <div>
                      <div>{order.margin.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {satsToBtc(order.margin).toFixed(8)} BTC
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm whitespace-nowrap text-gray-900">
                    ${parseFloat(order.liquidationPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
