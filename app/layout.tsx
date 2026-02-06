import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Escrow Platform - Secure Transaction Escrow Service',
    template: '%s | Escrow Platform',
  },
  description: 'Secure, decentralized escrow platform for safe transactions. Create and manage escrow agreements with blockchain technology.',
  keywords: ['escrow', 'blockchain', 'secure transactions', 'web3', 'decentralized'],
  authors: [{ name: 'Escrow Platform' }],
  creator: 'Escrow Platform',
  publisher: 'Escrow Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Escrow Platform - Secure Transaction Escrow Service',
    description: 'Secure, decentralized escrow platform for safe transactions.',
    siteName: 'Escrow Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escrow Platform',
    description: 'Secure, decentralized escrow platform for safe transactions.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
            <ToastProvider />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}

