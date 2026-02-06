'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { CreateEscrowParams } from '@/types/escrow'

export function CreateEscrowForm() {
  const { address } = useAccount()
  const router = useRouter()
  const [formData, setFormData] = useState<CreateEscrowParams>({
    seller: '',
    arbiter: '',
    amount: '',
    description: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!address) {
        setError('Please connect your wallet first')
        setIsLoading(false)
        return
      }

      // Demo: Create escrow with wallet connection
      console.log('Creating escrow:', {
        ...formData,
        buyer: address,
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate demo escrow ID
      const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Redirect to escrow details page
      router.push(`/escrows/${escrowId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create escrow')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="seller" className="block text-sm font-medium text-gray-700 mb-2">
          Seller Address
        </label>
        <input
          type="text"
          id="seller"
          name="seller"
          value={formData.seller}
          onChange={handleChange}
          required
          placeholder="0x..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
        />
        <p className="mt-1 text-sm text-gray-500">
          Address of the seller who will receive the funds
        </p>
      </div>

      <div>
        <label htmlFor="arbiter" className="block text-sm font-medium text-gray-700 mb-2">
          Arbiter Address
        </label>
        <input
          type="text"
          id="arbiter"
          name="arbiter"
          value={formData.arbiter}
          onChange={handleChange}
          required
          placeholder="0x..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
        />
        <p className="mt-1 text-sm text-gray-500">
          Address of the arbiter who can resolve disputes
        </p>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount (ETH)
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="0.001"
          placeholder="0.0"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe the transaction..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Escrow'}
        </button>
      </div>

      <div className="text-sm text-gray-500">
        <p>Buyer Address: {address || 'Not connected'}</p>
      </div>
    </form>
  )
}

