import { OrderForm } from './components/order-form.tsx'
import { OrdersTable } from './components/orders-table.tsx'

export function App() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-screen-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 px-4">
          <h1 className="text-foreground text-4xl font-bold">Futures Pricer</h1>
          <p className="text-foreground/60 mt-2">
            Calculate margin requirements and liquidation prices for inverse
            futures contracts
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-1">
          {/* Left Column: Form (1/3 width) */}
          <div className="lg:col-span-3">
            <OrderForm />
          </div>

          {/* Right Column: Orders Table (2/3 width) */}
          <div className="lg:col-span-9">
            <OrdersTable />
          </div>
        </div>
      </div>
    </div>
  )
}
