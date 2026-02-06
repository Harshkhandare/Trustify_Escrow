'use client'

import Link from 'next/link'
import { Escrow, EscrowStatus } from '@/types/escrow'
import { formatAddress } from '@/utils/format'

interface EscrowCardProps {
  escrow: Escrow
}

export function EscrowCard({ escrow }: EscrowCardProps) {
  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case EscrowStatus.FUNDED:
        return 'bg-blue-100 text-blue-800'
      case EscrowStatus.RELEASED:
        return 'bg-green-100 text-green-800'
      case EscrowStatus.REFUNDED:
        return 'bg-gray-100 text-gray-800'
      case EscrowStatus.DISPUTED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Link href={`/escrows/${escrow.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Escrow #{escrow.id.slice(0, 8)}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(escrow.status)}`}>
            {escrow.status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <span className="font-medium">Amount:</span> {escrow.amount} {escrow.token || 'ETH'}
          </div>
          {escrow.title && (
            <div className="font-semibold text-gray-900 mb-2">{escrow.title}</div>
          )}
          <div>
            <span className="font-medium">Buyer:</span> {formatAddress(escrow.buyer)}
          </div>
          <div>
            <span className="font-medium">Seller:</span> {formatAddress(escrow.seller)}
          </div>
          {escrow.description && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-gray-700">{escrow.description}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

