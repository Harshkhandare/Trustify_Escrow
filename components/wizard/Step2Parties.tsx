'use client'

import { EscrowFormData } from '@/types/escrowForm'
import { formatAddress } from '@/utils/format'

interface Step2PartiesProps {
  formData: EscrowFormData
  updateFormData: (updates: Partial<EscrowFormData>) => void
  errors: Record<string, string>
}

export function Step2Parties({ formData, updateFormData, errors }: Step2PartiesProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payer Wallet Address
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.payerAddress}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Connected</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Your connected wallet address (read-only)
        </p>
      </div>

      <div>
        <label htmlFor="payeeAddress" className="block text-sm font-medium text-gray-700 mb-2">
          Payee Wallet Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="payeeAddress"
          value={formData.payeeAddress}
          onChange={(e) => updateFormData({ payeeAddress: e.target.value })}
          placeholder="0x..."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white placeholder:text-gray-400 font-mono ${
            errors.payeeAddress ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.payeeAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.payeeAddress}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Enter the wallet address of the person receiving payment
        </p>
      </div>

      {formData.payeeAddress && formData.payeeAddress.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Address Preview:</p>
              <p className="font-mono">{formatAddress(formData.payeeAddress)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

