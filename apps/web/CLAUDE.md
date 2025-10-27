# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Frontend App Overview

This is the React 19 frontend application for the itoam crypto trading platform. It's built with Vite, TailwindCSS 4, and integrated with the tRPC backend via type-safe API calls.

**Tech Stack**:

- **React**: 19.2.0 with concurrent features
- **Build Tool**: Vite 7.1.12 with HMR
- **Styling**: TailwindCSS 4.1.16 with CSS variables for theming
- **State Management**: TanStack React Query 5.90.5 for server state
- **API Client**: tRPC 11.6.0 with type-safe procedures
- **UI Components**: shadcn/ui for pre-built accessible components
- **Icons**: Lucide React 0.548.0

## Development Commands

### Running the App

```bash
# Start dev server on localhost:5173
pnpm run -C apps/web dev

# Start all services (API + DB + Web)
pnpm start

# Production build
pnpm run -C apps/web build

# Preview production build locally
pnpm run -C apps/web preview
```

### Code Quality & Validation

```bash
# Type check TypeScript
pnpm run -C apps/web type-check

# Run ESLint (from workspace root)
pnpm lint

# Format code with Prettier (from workspace root)
pnpm format

# Full CI pipeline (from workspace root)
pnpm run ci
```

## Application Architecture

### Folder Structure

```
apps/web/
├── src/
│   ├── components/         # React components
│   │   └── users.tsx       # Example: data table with mutations
│   ├── lib/
│   │   └── utils.ts        # cn() utility for class merging
│   ├── app.tsx             # Root app component
│   ├── main.tsx            # Entry point (imports index.css)
│   ├── utils.ts            # tRPC client setup + React Query
│   └── index.css           # Global styles with theme variables
├── index.html              # HTML entry point
├── vite.config.ts          # Vite config with path aliases
├── tsconfig.json           # TypeScript paths config
├── components.json         # shadcn/ui configuration
└── package.json            # Dependencies
```

### Entry Point Flow

```
index.html
  ↓ (loads)
src/main.tsx
  ↓ (imports)
src/index.css (TailwindCSS + theme variables)
@itoam/ui/globals.css (shared UI styles)
  ↓ (renders)
QueryClientProvider (React Query)
  ↓
App component
  ↓
Routes and components with tRPC queries/mutations
```

## Data Fetching Pattern

### tRPC Client Setup (`src/utils.ts`)

```typescript
// React Query client for caching
export const queryClient = new QueryClient()

// tRPC client pointing to backend
export const trpc = createTRPCOptionsProxy<ApiRouter>({
  queryClient,
  client: createTRPCClient<ApiRouter>({
    links: [
      httpLink({
        url: `http://localhost:3000/trpc`,
        transformer: superJSON, // Handles Date, Map serialization
      }),
    ],
  }),
})
```

### Query Pattern (Read Data)

```typescript
import { useQuery } from '@tanstack/react-query'
import { trpc } from '@/utils'

function MyComponent() {
  // Fetch data
  const { data: users, isLoading, error } = useQuery(
    trpc.getUsers.queryOptions()
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.email}</li>
      ))}
    </ul>
  )
}
```

### Mutation Pattern (Create/Update/Delete)

```typescript
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/utils'
import { queryClient } from '@/utils'

function EditUserForm({ userId }: { userId: string }) {
  // Define mutation
  const updateMutation = useMutation(
    trpc.updateEmail.mutationOptions({
      onSuccess: async () => {
        // Refetch related queries after successful update
        await queryClient.invalidateQueries(
          trpc.getUsers.queryFilter()
        )
      },
    })
  )

  const handleSubmit = async (newEmail: string) => {
    try {
      await updateMutation.mutateAsync({
        id: userId,
        email: newEmail,
      })
      alert('Updated successfully')
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <form onSubmit={e => {
      e.preventDefault()
      handleSubmit(e.currentTarget.email.value)
    }}>
      <input name="email" type="email" />
      <button disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### Error Handling

All tRPC errors are automatically typed and serialized. Access error messages:

```typescript
try {
  await mutation.mutateAsync(data)
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message) // TRPCClientError message
  }
}
```

## Styling & Components

### TailwindCSS 4 with CSS Variables

The app uses TailwindCSS 4 with OKLch color spaces and CSS variables for theming. Custom theme is defined in `src/index.css`:

```css
:root {
  --radius: 0.625rem;
  --primary: oklch(0.205 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... more variables */
}

.dark {
  --primary: oklch(0.922 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark mode overrides */
}
```

All theme colors are available as Tailwind utilities:

- `bg-primary`, `text-foreground`, `border-border`, etc.
- `bg-destructive`, `bg-muted`, `bg-accent`, `bg-sidebar`
- `ring-ring` for focus states

### Class Name Merging (`cn` utility)

Always use the `cn()` utility when combining conditional classes to avoid Tailwind conflicts:

```typescript
import { cn } from '@/lib/utils'

// Safe composition
className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)}
```

**Never do this**:

```typescript
// ❌ Wrong - Tailwind conflicts not resolved
className={`px-2 ${condition && 'px-4'}`}
```

### Using shadcn/ui Components

shadcn/ui is pre-configured. Add components as needed:

```bash
# Add a button component
pnpm dlx shadcn@latest add button

# Add multiple at once
pnpm dlx shadcn@latest add card input select
```

Components are copied into `src/components/ui/` and can be customized:

```typescript
import { Button } from '@/components/ui/button'

export function MyButton() {
  return <Button variant="destructive">Delete</Button>
}
```

**Available Variants** (see `@itoam/ui` for base Button):

- Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Sizes: `default`, `sm`, `lg`, `icon`

### Using Shared UI Components

Shared components from `@itoam/ui` package:

```typescript
import { Button } from '@itoam/ui/button'
import { Input } from '@itoam/ui/input'
```

## Path Aliases & Imports

Import paths use the `@/` alias pointing to `src/`:

```typescript
// ✓ Correct
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { trpc, queryClient } from '@/utils'

// ❌ Avoid
import { Button } from '../components/ui/button'
import { cn } from '../../lib/utils'
```

Configured in:

- `vite.config.ts`: Path resolution
- `tsconfig.json`: TypeScript path mapping

## Common Development Tasks

### Adding a New Component with tRPC Integration

1. Create component file: `src/components/my-feature.tsx`
2. Import tRPC client and React Query:
   ```typescript
   import { useQuery, useMutation } from '@tanstack/react-query'
   import { trpc, queryClient } from '@/utils'
   ```
3. Use `useQuery(trpc.procedureName.queryOptions())` for fetches
4. Use `useMutation(trpc.procedureName.mutationOptions())` for mutations
5. Import UI components:
   ```typescript
   import { Button } from '@/components/ui/button'
   import { Input } from '@/components/ui/input'
   ```

### Adding a New tRPC Procedure

Backend procedures are defined in `packages/trpc-api/src/router.ts`. To use a new procedure:

1. Ensure it's exported from the tRPC router
2. In your component, access it via `trpc.procedureName.queryOptions()` or `.mutationOptions()`
3. The type will be fully inferred from the backend definition

### Implementing Dark Mode Toggle

Dark mode is controlled by the `.dark` class on `<html>`:

```typescript
// Example dark mode toggle
document.documentElement.classList.toggle('dark')

// Or use a theme provider (can be added via shadcn)
pnpm dlx shadcn@latest add theme-provider
```

### Adding Form Validation

Use a form library with shadcn/ui:

```bash
# Install react-hook-form + zod
pnpm add react-hook-form zod

# Add form component from shadcn
pnpm dlx shadcn@latest add form
```

Example with validation:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={form.handleSubmit(data => console.log(data))}>
      <input {...form.register('email')} />
      {form.formState.errors.email && <span>Invalid email</span>}
    </form>
  )
}
```

## Debugging

### Frontend Debugging

```bash
# 1. Start dev server
pnpm run -C apps/web dev

# 2. Open browser DevTools (F12)
# - React DevTools extension helps inspect component props/state
# - Network tab shows tRPC calls to /trpc endpoint
# - Console shows any runtime errors
```

### Inspecting tRPC Calls

- **Network Tab**: Look for POST requests to `http://localhost:3000/trpc`
- **Payload**: Check request body for procedure name and input
- **Response**: Server response contains data, cached automatically by React Query

### React Query DevTools

Add React Query DevTools for inspecting cache:

```bash
pnpm add -D @tanstack/react-query-devtools
```

Then in app root:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
```

## Building for Production

```bash
# Build optimized bundle
pnpm run -C apps/web build

# Output is in dist/
# Optimizations:
# - Tree-shaking unused code
# - Minification
# - CSS extraction and minification
# - Asset hashing for cache busting
```

The build output is a static site ready to deploy to any CDN or static host.

## Important Notes

- **API Endpoint**: Backend runs on `http://localhost:3000/trpc` in development
- **SuperJSON**: Complex types (Date, Map, Set) are serialized by SuperJSON automatically
- **React Query Caching**: Don't worry about manual caching - React Query handles it
- **Type Safety**: Leverage TypeScript - if it compiles, the API contract is correct
- **Must Pass CI**: Run `pnpm run ci` before committing to ensure linting and types pass
- **Path Aliases**: Use `@/` for all imports to keep imports clean and refactor-safe

## Environment Variables

None required for local development - the app assumes:

- Backend API on `http://localhost:3000/trpc`
- Database accessible via API
- All configuration happens via Docker Compose in root

Override the API endpoint by editing `src/utils.ts` if needed.

## See Also

- **Root CLAUDE.md**: High-level project architecture and backend info
- **Root README**: Project setup and full command reference
- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **tRPC Docs**: https://trpc.io
- **React Query Docs**: https://tanstack.com/query
- **shadcn/ui**: https://ui.shadcn.com
