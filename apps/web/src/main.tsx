import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app.tsx'
import { QueryClientProvider } from '@tanstack/react-query'

import '@itoam/ui/globals.css'
import { queryClient } from './utils.ts'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- If it's not defined we are going to have a bad time
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
