import { OrderForm } from './components/order-form.tsx'
import { OrdersTable } from './components/orders-table.tsx'

export function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Futures Trading Pricer
          </h1>
          <p className="mt-2 text-gray-600">
            Calculate and manage your futures trading positions
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Column */}
          <div className="lg:col-span-1">
            <OrderForm />
          </div>

          {/* Table Column */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Orders</h2>
            <OrdersTable />
          </div>
        </div>
      </div>
    </div>
  )
}
