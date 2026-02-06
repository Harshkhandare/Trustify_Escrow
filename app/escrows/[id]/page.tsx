'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { Escrow, EscrowStatus } from '@/types/escrow'
import { formatAddress, formatAmount, formatDate } from '@/utils/format'
import { fetchEscrowById, updateEscrow } from '@/lib/api'
import { DEMO_WALLET_ADDRESS } from '@/utils/demoWallet'
import { ActivityTimeline } from '@/components/ActivityTimeline'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

export default function EscrowDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { address } = useAccount()
  const [escrow, setEscrow] = useState<Escrow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'fund' | 'release' | 'refund' | 'dispute'
    message: string
  } | null>(null)

  // Use demo wallet address if no wallet connected
  const userAddress = address || DEMO_WALLET_ADDRESS

  useEffect(() => {
    const loadEscrow = async () => {
      try {
        const escrowId = params.id as string
        const data = await fetchEscrowById(escrowId)
        setEscrow(data)
      } catch (err) {
        setError('Failed to load escrow')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadEscrow()
  }, [params.id])

  if (isLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600">Loading escrow details...</p>
        </div>
      </main>
    )
  }

  const handleActionClick = (action: 'fund' | 'release' | 'refund' | 'dispute') => {
    const messages = {
      fund: 'Are you sure you want to fund this escrow?',
      release: 'Are you sure you want to release funds to the seller?',
      refund: 'Are you sure you want to request a refund?',
      dispute: 'Are you sure you want to file a dispute?',
    }
    setConfirmAction({ type: action, message: messages[action] })
  }

  const handleConfirmAction = async () => {
    if (!confirmAction || !escrow) return
    
    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const updated = await updateEscrow(escrow.id, { action: confirmAction.type })
      setEscrow(updated)
      
      const messages = {
        fund: 'Escrow funded successfully!',
        release: 'Funds released successfully!',
        refund: 'Refund processed successfully!',
        dispute: 'Dispute filed successfully!',
      }
      toast.success(messages[confirmAction.type])
      setSuccess(messages[confirmAction.type])
      setConfirmAction(null)
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process action'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAction = async (action: 'fund' | 'release' | 'refund' | 'dispute') => {
    if (!escrow) return

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const updated = await updateEscrow(escrow.id, { action })
      setEscrow(updated)
      
      const messages = {
        fund: 'Escrow funded successfully!',
        release: 'Funds released successfully!',
        refund: 'Refund processed successfully!',
        dispute: 'Dispute filed successfully!',
      }
      toast.success(messages[action])
      setSuccess(messages[action])
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process action'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleArbiterAction = async (action: 'release' | 'refund') => {
    if (!escrow) return

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const updated = await updateEscrow(escrow.id, { action })
      setEscrow(updated)
      
      const messages = {
        release: 'Funds released to seller successfully!',
        refund: 'Funds refunded to buyer successfully!',
      }
      setSuccess(messages[action])
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process action')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!escrow) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Escrow Not Found</h1>
            <Link
              href="/escrows"
              className="text-primary-600 hover:underline"
            >
              ← Back to Escrows
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const isBuyer = userAddress?.toLowerCase() === escrow.buyer.toLowerCase()
  const isSeller = userAddress?.toLowerCase() === escrow.seller.toLowerCase()
  const isArbiter = userAddress?.toLowerCase() === escrow.arbiter.toLowerCase()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Escrow Details</h1>
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Escrow #{escrow.id.slice(0, 8)}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                escrow.status === EscrowStatus.RELEASED ? 'bg-green-100 text-green-800' :
                escrow.status === EscrowStatus.REFUNDED ? 'bg-gray-100 text-gray-800' :
                escrow.status === EscrowStatus.DISPUTED ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {escrow.status}
              </span>
            </div>
          </div>

          {escrow.title && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Title</h3>
              <p className="text-xl text-gray-900">{escrow.title}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Amount</h3>
              <p className="text-2xl font-bold text-primary-600">
                {formatAmount(escrow.amount)} {escrow.token || 'ETH'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Created</h3>
              <p className="text-gray-600">{formatDate(escrow.createdAt)}</p>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Buyer</h3>
              <p className="text-gray-600 font-mono">{escrow.buyer}</p>
              {isBuyer && <span className="ml-2 text-sm text-primary-600">(You)</span>}
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Seller</h3>
              <p className="text-gray-600 font-mono">{escrow.seller}</p>
              {isSeller && <span className="ml-2 text-sm text-primary-600">(You)</span>}
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Arbiter</h3>
              <p className="text-gray-600 font-mono">{escrow.arbiter}</p>
              {isArbiter && <span className="ml-2 text-sm text-primary-600">(You)</span>}
            </div>
          </div>

          {escrow.description && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{escrow.description}</p>
            </div>
          )}

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-4 flex-wrap">
            {isBuyer && escrow.status === EscrowStatus.PENDING && (
              <button
                onClick={() => handleActionClick('fund')}
                disabled={isProcessing}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fund Escrow
              </button>
            )}
            {isBuyer && escrow.status === EscrowStatus.FUNDED && (
              <>
                <button
                  onClick={() => handleActionClick('release')}
                  disabled={isProcessing}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Release Funds
                </button>
                <button
                  onClick={() => handleActionClick('refund')}
                  disabled={isProcessing}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Refund
                </button>
                <button
                  onClick={() => handleActionClick('dispute')}
                  disabled={isProcessing}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  File Dispute
                </button>
              </>
            )}
            {isArbiter && escrow.status === EscrowStatus.DISPUTED && (
              <>
                <button
                  onClick={() => handleArbiterAction('release')}
                  disabled={isProcessing}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Release to Seller'}
                </button>
                <button
                  onClick={() => handleArbiterAction('refund')}
                  disabled={isProcessing}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Refund to Buyer'}
                </button>
              </>
            )}
          </div>
        </div>

        <Modal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title="Confirm Action"
          onConfirm={handleConfirmAction}
          confirmText="Confirm"
          confirmVariant={confirmAction?.type === 'refund' || confirmAction?.type === 'dispute' ? 'danger' : 'primary'}
        >
          <p>{confirmAction?.message}</p>
        </Modal>
        </div>

        <div className="mt-8">
          <Link
            href="/escrows"
            className="text-primary-600 hover:underline"
          >
            ← Back to Escrows
          </Link>
        </div>
      </div>
    </main>
  )
}

