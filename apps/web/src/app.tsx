import { OrderForm } from './components/order-form.tsx'
import { OrdersTable } from './components/orders-table.tsx'

export function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Futures Pricer
          </h1>
          <p className="mt-2 text-foreground/60">
            Calculate margin requirements and liquidation prices for inverse futures contracts
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Form (1/3 width) */}
          <div className="lg:col-span-1">
            <OrderForm />
          </div>

          {/* Right Column: Orders Table (2/3 width) */}
          <div className="lg:col-span-2">
            <OrdersTable />
          </div>
        </div>
      </div>
    </div>
  )
}
