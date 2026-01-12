'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

/**
 * React Query Provider
 * 
 * Configures global settings for React Query:
 * - Background refetching
 * - Cache management
 * - Error retry logic
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Refetch data when window regains focus
            refetchOnWindowFocus: true,
            // Refetch data when component mounts if data is stale
            refetchOnMount: true,
            // Data is considered stale after 60 seconds
            staleTime: 60 * 1000,
            // Keep cached data for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Exponential backoff: 1s, 2s, 4s
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
