'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { EscrowStatus } from '@/types/escrow'
import { useState } from 'react'

export function EscrowFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest')

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // Reset to first page
    router.push(`/escrows?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              handleFilterChange('status', e.target.value)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {Object.values(EscrowStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              handleFilterChange('sortBy', e.target.value)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            aria-label="Sort by"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high">Amount: High to Low</option>
            <option value="amount-low">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {(status || sortBy !== 'newest') && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setStatus('')
              setSortBy('newest')
              router.push('/escrows')
            }}
            className="text-sm text-primary-600 hover:text-primary-700 underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}


