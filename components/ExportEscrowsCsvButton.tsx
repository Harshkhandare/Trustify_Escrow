'use client'

import type { Escrow } from '@/types/escrow'
import { downloadTextFile, toCsv } from '@/lib/csv'

export function ExportEscrowsCsvButton({
  escrows,
  filenamePrefix,
  className,
}: {
  escrows: Escrow[]
  filenamePrefix: string
  className?: string
}) {
  const handleExport = () => {
    const headers = [
      'id',
      'title',
      'type',
      'buyer',
      'seller',
      'arbiter',
      'amount',
      'token',
      'status',
      'createdAt',
    ]

    const rows = escrows.map((e) => ({
      id: e.id,
      title: e.title || '',
      type: e.type || '',
      buyer: e.buyer,
      seller: e.seller,
      arbiter: e.arbiter,
      amount: e.amount,
      token: e.token,
      status: e.status,
      createdAt: new Date((e.createdAt || 0) * 1000).toISOString(),
    }))

    const csv = toCsv(headers, rows)
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    downloadTextFile(`${filenamePrefix}-${stamp}.csv`, csv, 'text/csv;charset=utf-8')
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={!escrows || escrows.length === 0}
      className={
        className ||
        'bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
      }
      title={escrows.length === 0 ? 'No escrows to export' : 'Export CSV'}
    >
      Export CSV
    </button>
  )
}


