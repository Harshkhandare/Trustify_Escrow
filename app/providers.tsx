'use client'

import { WagmiConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config, chains } from '@/config/wagmi'
import '@rainbow-me/rainbowkit/styles.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <ErrorBoundary>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider chains={chains}>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </ErrorBoundary>
  )
}

