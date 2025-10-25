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
  - Subscribes to LN Markets WebSocket API for 1-minute OHLC data
  - Emits 'ohlc/1m' events when new candle data arrives
- **tRPC Router**: Type-safe API procedures with middleware for logging and error handling

**Middleware Pattern** (packages/trpc-api/src/router.ts):

- Request logging middleware logs all incoming requests with path, type, and data
- Error logging middleware logs failed operations

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
- `OHLC`: Candle data structure (Open, High, Low, Close)
- Export these from the types package for shared use

## Key Patterns

### Adding New tRPC Procedures

1. Add procedure to `packages/trpc-api/src/router.ts`
2. Use `createProcedure` which includes default middleware
3. Define input with Zod schema (`.input()`)
4. Define output with Zod schema (`.output()`)
5. Implement query/mutation logic with database access via `ctx.db`
6. Errors are typed with TRPCError for proper client handling

**Example**:

```typescript
export const router = createTRPCRouter({
  getUsers: procedure.output(z.array(userSchema)).query(async ({ ctx }) => {
    return ctx.db.select().from(users)
  }),
})
```

### Database Schema Changes

1. Update schema in `packages/database/src/schema.ts`
2. Run `pnpm run -C packages/database drizzle-kit generate` to create migration
3. Run `pnpm run -C packages/database drizzle-kit migrate` to apply

### Frontend Component Integration

1. Import `trpc` from `utils.ts`
2. Use React Query hooks with tRPC options: `useQuery(trpc.procedureName.queryOptions())`
3. Invalidate cache on mutation success to trigger refetch

## Important Notes

- **Production Ready**: Code must pass `pnpm run ci` before submission
- **Type Safety**: All packages are strict TypeScript - leverage the type system
- **All Packages Mandatory**: Currently installed packages must be used; additional packages require justification
- **Event System**: Backend uses Node.js EventEmitter for real-time data streaming from external APIs
- **Docker Compose**: Local development uses Docker for PostgreSQL and services
- **Workspace**: Uses pnpm monorepo with local package references (workspace:\*)

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
