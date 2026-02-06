'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Escrow } from '@/types/escrow'
import { EscrowCard } from '@/components/EscrowCard'
import { SearchBar } from '@/components/SearchBar'
import { EscrowFilters } from '@/components/EscrowFilters'
import { Pagination } from '@/components/Pagination'
import { fetchEscrows } from '@/lib/api'
import toast from 'react-hot-toast'

export default function EscrowsPage() {
  const searchParams = useSearchParams()
  const [escrows, setEscrows] = useState<Escrow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    const loadEscrows = async () => {
      try {
        setIsLoading(true)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const address = searchParams.get('address') || undefined
        const status = searchParams.get('status') as any || undefined
        const query = searchParams.get('q') || undefined

        const data = await fetchEscrows({
          address,
          status,
          page,
          limit: 20,
        })

        // Filter by search query if provided
        let filtered = data.escrows
        if (query) {
          const lowerQuery = query.toLowerCase()
          filtered = data.escrows.filter(
            (e) =>
              e.title?.toLowerCase().includes(lowerQuery) ||
              e.description?.toLowerCase().includes(lowerQuery) ||
              e.buyer?.toLowerCase().includes(lowerQuery) ||
              e.seller?.toLowerCase().includes(lowerQuery)
          )
        }

        setEscrows(filtered)
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        })
        setError(null)
      } catch (err) {
        setError('Failed to load escrows')
        toast.error('Failed to load escrows')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadEscrows()
  }, [searchParams])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">All Escrows</h1>
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

        <EscrowFilters />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading escrows...</p>
          </div>
        ) : escrows.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">No escrows found</p>
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
