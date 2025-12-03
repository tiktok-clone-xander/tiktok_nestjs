'use client'

import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'

/**
 * SWR Global Configuration Provider
 * Optimized for performance with caching and deduplication
 */
export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        // Performance optimizations
        revalidateOnFocus: false, // Don't revalidate on tab focus (saves bandwidth)
        revalidateOnReconnect: true, // Revalidate when connection restored
        dedupingInterval: 2000, // Dedupe identical requests within 2 seconds
        focusThrottleInterval: 5000, // Throttle focus revalidation

        // Error handling
        errorRetryCount: 2, // Retry failed requests twice
        errorRetryInterval: 5000, // Wait 5s between retries
        shouldRetryOnError: true,

        // Data handling
        keepPreviousData: true, // Keep showing old data while fetching new

        // Success callback for debugging (only in dev)
        onSuccess: (data, key, config) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[SWR] Success:`, key)
          }
        },

        // Error callback
        onError: (error, key) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(`[SWR] Error:`, key, error)
          }
        },

        // Provider for manual cache control
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  )
}
