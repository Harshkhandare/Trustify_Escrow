'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Escrow } from '@/types/escrow'
import { fetchEscrows } from '@/lib/api'
import toast from 'react-hot-toast'
import { EscrowStatus } from '@/types/escrow'

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Escrow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<Escrow | null>(null)

  useEffect(() => {
    const loadDisputes = async () => {
      try {
        setIsLoading(true)
        const data = await fetchEscrows({ status: EscrowStatus.DISPUTED, limit: 100 })
        setDisputes(data.escrows)
      } catch (error) {
        toast.error('Failed to load disputes')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDisputes()
  }, [])

  const handleResolve = async (escrowId: string, resolution: 'release' | 'refund') => {
    try {
      const response = await fetch(`/api/escrows/${escrowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: resolution }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to resolve dispute')
      }

      toast.success(`Dispute resolved: ${resolution === 'release' ? 'Funds released to seller' : 'Funds refunded to buyer'}`)
      setDisputes(disputes.filter(d => d.id !== escrowId))
      setSelectedDispute(null)
    } catch (error) {
      toast.error('Failed to resolve dispute')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading disputes...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dispute Resolution</h1>
          <Link
            href="/admin"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>

        {disputes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No active disputes</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Disputes List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Active Disputes ({disputes.length})</h2>
              {disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition ${
                    selectedDispute?.id === dispute.id ? 'ring-2 ring-primary-600' : ''
                  }`}
                  onClick={() => setSelectedDispute(dispute)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">
                      {dispute.title || `Escrow #${dispute.id.slice(0, 8)}`}
                    </h3>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                      DISPUTED
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Amount: {dispute.amount} {dispute.token}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Created: {new Date(dispute.createdAt * 1000).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Dispute Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {selectedDispute ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">Dispute Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Escrow ID
                      </label>
                      <p className="text-gray-900 font-mono text-sm">{selectedDispute.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buyer
                      </label>
                      <p className="text-gray-900">{selectedDispute.buyer}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seller
                      </label>
                      <p className="text-gray-900">{selectedDispute.seller}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {selectedDispute.amount} {selectedDispute.token}
                      </p>
                    </div>
                    {selectedDispute.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <p className="text-gray-900">{selectedDispute.description}</p>
                      </div>
                    )}
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Resolution Actions
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleResolve(selectedDispute.id, 'release')}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          Release to Seller
                        </button>
                        <button
                          onClick={() => handleResolve(selectedDispute.id, 'refund')}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                          Refund to Buyer
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Select a dispute to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

