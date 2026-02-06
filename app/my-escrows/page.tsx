'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Escrow } from '@/types/escrow'
import { EscrowCard } from '@/components/EscrowCard'
import { isAuthenticated } from '@/utils/auth'
import { fetchEscrows } from '@/lib/api'
import { DEMO_WALLET_ADDRESS } from '@/utils/demoWallet'
import { SearchBar } from '@/components/SearchBar'
import { Pagination } from '@/components/Pagination'
import toast from 'react-hot-toast'

export default function MyEscrowsPage() {
  const { address } = useAccount()
  const router = useRouter()
  const [escrows, setEscrows] = useState<Escrow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // Use demo wallet address if no wallet connected
  const userAddress = address || DEMO_WALLET_ADDRESS

  useEffect(() => {
    const authenticated = isAuthenticated()
    if (!authenticated) {
      router.push('/login')
      return
    }
  }, [router])

  useEffect(() => {
    const loadMyEscrows = async () => {
      try {
        setIsLoading(true)
        const data = await fetchEscrows({ address: userAddress, page: 1, limit: 20 })
        setEscrows(data.escrows)
        setPagination(data.pagination)
        setError(null)
      } catch (err) {
        setError('Failed to load your escrows')
        toast.error('Failed to load your escrows')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (userAddress) {
      loadMyEscrows()
    }
  }, [userAddress])

  const authenticated = isAuthenticated()

  if (!authenticated) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">My Escrows</h1>
            <p className="text-xl text-gray-600 mb-8">
              Please login to view your escrows
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Go to Login
              </Link>
            </div>
            <div className="mt-8">
              <Link
                href="/"
                className="text-primary-600 hover:underline"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Escrows</h1>
          <div className="flex gap-4 items-center">
            <Link
              href="/create"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Create Escrow
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <SearchBar />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading your escrows...</p>
          </div>
        ) : escrows.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">You don't have any escrows yet</p>
            <Link
              href="/create"
              className="text-primary-600 hover:underline"
            >
              Create your first escrow
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {escrows.map((escrow) => (
                <EscrowCard key={escrow.id} escrow={escrow} />
              ))}
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
            />
          </>
        )}

        <div className="mt-8">
          <Link
            href="/"
            className="text-primary-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
