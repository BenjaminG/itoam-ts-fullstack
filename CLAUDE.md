# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript fullstack application for a crypto trading platform built with modern tooling. It uses a monorepo structure with a shared database, API, and React frontend. The primary tech stack includes:

- **Backend**: Node.js + Fastify + tRPC
- **Frontend**: React 19 + Vite + TailwindCSS 4
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Package Manager**: pnpm (v10+)
- **Node Version**: v22.18.0

## Commands

### Development

- `pnpm start` - Starts all services (PostgreSQL, API server on :3000, Web frontend on :5173) using Docker Compose
- `pnpm run -C apps/api dev` - Run API in dev mode with tsx watch
- `pnpm run -C apps/web dev` - Run frontend dev server
- `pnpm run -C packages/database drizzle-kit migrate` - Run database migrations
- `pnpm run -C packages/database seed` - Seed database with initial data

### Code Quality

- `pnpm run ci` - Full CI pipeline: spell-check → format → knip → lint → type-check → build
- `pnpm lint` - Run ESLint on all packages
- `pnpm type-check` - TypeScript type checking across all packages
- `pnpm format` - Format code with Prettier
- `pnpm knip` - Detect unused imports
- `pnpm run spell-check` - Check spelling

### Build & Cleanup

- `pnpm build` - Build all packages (pnpm run --recursive build)
- `pnpm stop` - Stop all Docker containers and remove volumes
- `pnpm run clean` - Clean build artifacts and cache

## Architecture

### Monorepo Structure

```
apps/
├── api/           # Fastify backend server
└── web/           # React frontend application

packages/
├── database/      # Drizzle ORM schema and client
├── trpc-api/      # Shared tRPC router definition
├── types/         # Shared TypeScript types (e.g., OHLC, ApiEvents)
├── ui/            # Reusable React components and styles
├── shared/        # Shared utilities
└── typescript-config/ # ESLint and TypeScript configs
```

### Backend Architecture (apps/api)

**Entry Point**: `src/index.ts`

- Creates Fastify server with tRPC plugin at `/trpc` prefix
- Sets up CORS with wildcard origin
- Initializes database client and event emitter
- Listens on port 3000

**Key Components**:

- **Database Client**: Drizzle ORM connected to PostgreSQL
- **Event Emitter**: Node.js EventEmitter typed with `ApiEvents` from @itoam/types
  - Created in `src/events.ts` via `createEventEmitter()`
  - Subscribes to LN Markets WebSocket API (`wss://api.lnmarkets.com/ws`)
  - Listens to `ohlc` subscription with resolution '1' (1-minute candles)
  - Emits 'ohlc/1m' events when new candle data arrives
  - Uses untyped tRPC client with WebSocket link and SuperJSON transformer
- **tRPC Router**: Type-safe API procedures with middleware for logging and error handling
- **Initial Candle**: `getInitialCandle({ timeframe: '1d' })` is called on server startup to fetch historical data

**Middleware Pattern** (packages/trpc-api/src/router.ts):

- Request logging middleware logs all incoming requests with path, type, and data
- Error logging middleware logs failed operations

**Real-time Event Integration**:

The backend can stream real-time data from external sources via the event emitter:

```typescript
// In src/events.ts
const lnmTRPCClient = createTRPCUntypedClient({
  links: [
    wsLink({
      client: createWSClient({ url: 'wss://api.lnmarkets.com/ws' }),
      transformer: superJSON,
    }),
  ],
})

lnmTRPCClient.subscription(
  'ohlc',
  { resolution: '1' },
  {
    onData: (data) => emitter.emit('ohlc/1m', data as OHLC),
  }
)
```

tRPC procedures can access this emitter via `ctx.events` to emit custom events or subscribe to external data streams.

### Frontend Architecture (apps/web)

**Key Setup**:

- **tRPC Client**: Initialized in `src/utils.ts` with httpLink to `http://localhost:3000/trpc`
- **Query Client**: TanStack React Query for cache management
- **SuperJSON Transformer**: Used for both client and server for complex data serialization

**Data Flow**:

- Components use `useQuery(trpc.procedureName.queryOptions())` for queries
- Use `useMutation(trpc.procedureName.mutationOptions())` for mutations
- React Query handles caching and auto-invalidation

**Component Pattern** (see `src/components/users.tsx`):

- Use TanStack React Query hooks directly with tRPC options
- `trpc.procedureName.queryOptions()` returns React Query options
- `queryClient.invalidateQueries(trpc.procedureName.queryFilter())` for cache invalidation

### Database Layer (packages/database)

**Schema** (`src/schema.ts`):

- Defined using Drizzle ORM `pgTable()` helper
- Exports PostgreSQL tables (e.g., `users` with UUID PK, email, password, balance, createdAt)

**Client** (`src/client.ts`):

- Factory function `createClient()` returns Drizzle database instance
- Uses DATABASE_URL env var or localhost connection string

**Migrations & Seeding**:

- `drizzle-kit migrate` runs SQL migrations
- `scripts/seed.ts` provides initial data

### Type Safety

**Type Exports** (packages/types):

- `ApiEvents`: Type definition for event emitter events
- `OHLC`: Candle data structure (Open, High, Low, Close, Volume, Time)
- `Timeframe`: Union type `'1m' | '5m' | '15m' | '1h' | '4h' | '1d'`
- Export these from the types package for shared use

### Shared Utilities (packages/shared)

The `@itoam/shared` package provides high-precision calculation functions for crypto trading operations using Decimal.js to avoid floating-point errors:

**Bitcoin Conversions**:

- `btcToSats(btcAmount: number): number` - Convert BTC to satoshis (× 100,000,000)
- `satsToBtc(satsAmount: number): number` - Convert satoshis to BTC (÷ 100,000,000)
- `usdToBtc(usdAmount: number, btcPrice: number): number` - Convert USD to BTC at given price

**Futures Trading Calculations**:

- `calculateMargin(quantityUsd: number, priceUsd: number, leverage: number): number`
  - Formula: `Margin = Quantity / (Price × Leverage)`
  - Returns margin in satoshis (integer)
  - Used to determine required collateral for a position

- `calculateLiquidationPrice(side: 'b' | 's', entryPriceUsd: number, marginSats: number, quantityUsd: number): number`
  - Formula for Long (buy): `1 / (1/EntryPrice + Margin/Quantity)`
  - Formula for Short (sell): `1 / (1/EntryPrice - Margin/Quantity)`
  - Returns liquidation price in USD, rounded to nearest 0.5
  - Throws error if denominator becomes zero/negative (invalid position)

**Usage Pattern**:

```typescript
import {
  calculateMargin,
  calculateLiquidationPrice,
  satsToBtc,
} from '@itoam/shared'

const margin = calculateMargin(10000, 100000, 10) // 10k USD @ 100k price @ 10x
const liqPrice = calculateLiquidationPrice('b', 100000, margin, 10000)
const marginBtc = satsToBtc(margin) // Convert to BTC for display
```

**Important**: Always use these shared functions for calculations to ensure consistency between frontend preview and backend validation.

## Key Patterns

### Adding New tRPC Procedures

1. Add procedure to `packages/trpc-api/src/router.ts`
2. Use `createProcedure` which includes default middleware
3. Define input with Zod schema (`.input()`) - **Important**: Import from `zod/v4`, not `zod`
4. Define output with Zod schema (`.output()`)
5. Implement query/mutation logic with database access via `ctx.db`
6. Errors are typed with TRPCError for proper client handling

**Basic Example**:

```typescript
import { z } from 'zod/v4' // Note: zod/v4, not zod

export const router = createTRPCRouter({
  getUsers: procedure.output(z.array(userSchema)).query(async ({ ctx }) => {
    return ctx.db.select().from(users)
  }),
})
```

### Advanced tRPC Patterns

**Cursor-based Pagination**:

Implement infinite scroll with cursor-based pagination for large datasets:

```typescript
.input(
  z.object({
    limit: z.number().int().min(1).max(100).default(20),
    cursor: z.string().nullish(),  // ID of last item from previous page
    // Optional filters
    side: z.enum(['b', 's']).optional(),
  })
)
.output(
  z.object({
    orders: z.array(ordersSelectSchema),
    nextCursor: z.string().nullish(),  // ID for next page, or null if no more
  })
)
.query(async ({ ctx, input }) => {
  const limit = input.limit
  const fetchCount = limit + 1  // Fetch +1 to check if more pages exist

  // If cursor provided, fetch cursor row to get its timestamp
  let cursorCreatedAt: Date | undefined
  if (input.cursor) {
    const [cursorRow] = await ctx.db
      .select({ createdAt: orders.createdAt })
      .from(orders)
      .where(eq(orders.id, input.cursor))
    cursorCreatedAt = cursorRow?.createdAt
  }

  // Build where conditions
  const whereConditions: unknown[] = []
  if (cursorCreatedAt) {
    whereConditions.push(lt(orders.createdAt, cursorCreatedAt))
  }
  if (input.side) {
    whereConditions.push(eq(orders.side, input.side))
  }

  // Query with conditions
  const results = await (whereConditions.length > 0
    ? ctx.db.select().from(orders).where(and(...whereConditions))
    : ctx.db.select().from(orders)
  )
    .orderBy(desc(orders.createdAt))
    .limit(fetchCount)

  // Determine if more pages exist
  const hasMore = results.length > limit
  const paginatedResults = hasMore ? results.slice(0, limit) : results
  const nextCursor = hasMore ? paginatedResults[paginatedResults.length - 1]?.id : undefined

  return { orders: paginatedResults, nextCursor }
})
```

**Input Coercion for Numbers**:

Use `.coerce` to automatically convert string inputs to numbers (useful for form data):

```typescript
.input(
  z.object({
    quantity: z.coerce
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .max(500000, 'Quantity cannot exceed 500,000'),
    leverage: z.coerce
      .number()
      .int('Leverage must be an integer')
      .min(1)
      .max(100),
    entryPrice: z.coerce
      .number()
      .positive('Entry price must be positive'),
  })
)
```

**Drizzle-Zod Schema Generation**:

Auto-generate Zod schemas from Drizzle tables to keep validation in sync with database schema:

```typescript
import { createSelectSchema } from 'drizzle-zod'
import { orders } from '@itoam/database/schema'

const ordersSelectSchema = createSelectSchema(orders)
  // Use in output
  .output(ordersSelectSchema)

  // Omit fields
  .output(ordersSelectSchema.omit({ password: true }))
```

**Custom Validation Logic**:

Add business logic validation before database operations:

```typescript
.mutation(async ({ ctx, input }) => {
  // Validate edge cases
  if (input.side === 's' && input.leverage === 1) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Short positions require leverage of 2x or higher',
    })
  }

  // Validate step constraints
  const priceRounded = Math.round(input.entryPrice * 2) / 2
  if (Math.abs(priceRounded - input.entryPrice) > 0.001) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Entry price must be rounded to nearest 0.5',
    })
  }

  // Proceed with database operation
  const [order] = await ctx.db.insert(orders).values({...}).returning()
  return order
})
```

### Database Schema Changes

The database migration workflow is a two-step process:

1. **Update schema** in `packages/database/src/schema.ts`
2. **Generate migration**: Run `pnpm run -C packages/database drizzle-kit generate`
   - This analyzes the schema changes and creates a SQL migration file in `migrations/`
   - The file is auto-named with a timestamp (e.g., `0003_fancy_name.sql`)
3. **Apply migration**: Run `pnpm run -C packages/database drizzle-kit migrate`
   - This executes the SQL migration against the database
   - Migrations are tracked in the `__drizzle_migrations` table

**Example Schema**:

```typescript
export const orders = pgTable('orders', {
  id: text('id')
    .default(sql<string>`uuid_generate_v4 ()`)
    .primaryKey()
    .notNull(),
  side: char('side', { length: 1 }).notNull(), // 'b' or 's'
  quantity: numeric('quantity').notNull(), // Numeric for precision
  leverage: numeric('leverage').notNull(),
  entryPrice: numeric('entry_price').notNull(),
  margin: bigint('margin', { mode: 'number' }).notNull(), // Satoshis as bigint
  liquidationPrice: numeric('liquidation_price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

**Important**: Use `numeric` for monetary values requiring precision, and `bigint` with `mode: 'number'` for satoshi amounts.

### Frontend Component Integration

1. Import `trpc` from `utils.ts`
2. Use React Query hooks with tRPC options: `useQuery(trpc.procedureName.queryOptions())`
3. Invalidate cache on mutation success to trigger refetch

### Frontend Form Patterns

**Number Formatting with react-number-format**:

Use `NumericFormat` component for formatting currency and numeric inputs:

```typescript
import { NumericFormat } from 'react-number-format'

<NumericFormat
  value={formData.quantity}
  onValueChange={(values) => {
    setFormData({ ...formData, quantity: values.value })  // Use .value for raw number
  }}
  thousandSeparator=","
  decimalSeparator="."
  decimalScale={0}  // No decimals for USD quantity
  allowNegative={false}
  placeholder="0"
/>

// For BTC display (8 decimals)
<NumericFormat
  value={satsToBtc(margin)}
  displayType="text"  // Read-only display
  decimalScale={8}
  fixedDecimalPlaces
  suffix=" BTC"
/>

// For USD display with $ prefix
<NumericFormat
  value={liquidationPrice}
  displayType="text"
  prefix="$"
  thousandSeparator=","
  decimalScale={2}
/>
```

**Real-time Calculation Preview**:

Use `useMemo` to compute derived values efficiently and display them in real-time as the user types:

```typescript
import { useMemo } from 'react'
import { calculateMargin, calculateLiquidationPrice, satsToBtc } from '@itoam/shared'

function OrderForm() {
  const [formData, setFormData] = useState({
    side: 'b' as 'b' | 's',
    quantity: '',
    leverage: '1',
    entryPrice: '',
  })

  // Calculate preview values
  const calculations = useMemo(() => {
    const qty = parseFloat(formData.quantity)
    const lev = parseFloat(formData.leverage)
    const price = parseFloat(formData.entryPrice)

    // Validate all inputs are valid numbers
    if (!qty || !lev || !price || qty <= 0 || lev <= 0 || price <= 0) {
      return null
    }

    const margin = calculateMargin(qty, price, lev)
    const liquidationPrice = calculateLiquidationPrice(formData.side, price, margin, qty)

    return {
      margin,
      marginBtc: satsToBtc(margin),
      liquidationPrice,
    }
  }, [formData.quantity, formData.leverage, formData.entryPrice, formData.side])

  return (
    <div>
      {/* Input fields */}
      {calculations && (
        <div>
          <p>Margin: {calculations.marginBtc} BTC ({calculations.margin} sats)</p>
          <p>Liquidation: ${calculations.liquidationPrice}</p>
        </div>
      )}
    </div>
  )
}
```

**Form Validation and Error Display**:

Store validation errors in state and display them alongside inputs:

```typescript
const [errors, setErrors] = useState<Record<string, string>>({})

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Clear previous errors
  setErrors({})

  try {
    await createOrderMutation.mutateAsync(formData)
  } catch (error) {
    if (error instanceof Error) {
      // Display tRPC error message
      setErrors({ submit: error.message })
    }
  }
}

// In JSX
{errors.submit && <p className="text-destructive">{errors.submit}</p>}
```

## Important Notes

- **Production Ready**: Code must pass `pnpm run ci` before submission
- **Type Safety**: All packages are strict TypeScript - leverage the type system
- **Zod v4**: Import from `zod/v4` not `zod` - this is intentional for the project
- **All Packages Mandatory**: Currently installed packages must be used; additional packages require justification
- **Event System**: Backend uses Node.js EventEmitter for real-time data streaming from external APIs
- **Docker Compose**: Local development uses Docker for PostgreSQL and services
- **Workspace**: Uses pnpm monorepo with local package references (workspace:\*)

## Docker Configuration

The project uses Docker Compose for local development with the following setup:

**Services**:

- **PostgreSQL**: `postgres:18-alpine` (note: PostgreSQL 18, not 16)
  - Port: 5432
  - User: `postgres`
  - Password: `postgres`
  - Database: `postgres`
  - Volume: `postgres` for data persistence
- **API**: Fastify backend on port 3000
- **Web**: Vite dev server on port 5173

**Common Configuration** (applied to all services):

- `restart: unless-stopped` - Auto-restart on failure
- `init: true` - Proper signal handling for graceful shutdown
- Logging: JSON format, max 5MB per file, 10 files rotation
- Healthcheck: 5s interval, 4s timeout, 3 retries, 5s start period

**Environment Variables** (set automatically by Docker Compose):

```bash
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/postgres
LOG_LEVEL=debug
```

**Commands**:

- `pnpm start` - Starts all services via `./scripts/start.sh`
- `pnpm stop` - Stops containers and removes volumes
- Direct access: `docker compose up` / `docker compose down`

**Database Connection**:

- From host: `postgresql://postgres:postgres@localhost:5432/postgres`
- From containers: `postgresql://postgres:postgres@postgres:5432/postgres` (uses service name)

## Useful Development Patterns

### Running Single Tests

Not explicitly configured, but tests can be added using ts-node or tsx with test frameworks integrated into existing lint/type-check pipeline.

### Debugging

- Frontend: Open DevTools in browser (Vite dev server on :5173)
- Backend: Use `tsx --watch` which is configured in api dev command
- Database: Connect directly to postgres:5432 (user: postgres, pwd: postgres)

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (defaults to localhost)
- `NODE_ENV`: Set to 'development' by Docker Compose
- `LOG_LEVEL`: Set to 'debug' by Docker Compose
