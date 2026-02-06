'use client'

import { EscrowFormData, TokenType } from '@/types/escrowForm'

interface Step3PaymentProps {
  formData: EscrowFormData
  updateFormData: (updates: Partial<EscrowFormData>) => void
  errors: Record<string, string>
}

export function Step3Payment({ formData, updateFormData, errors }: Step3PaymentProps) {
  const feeAmount = formData.amount
    ? (parseFloat(formData.amount) * formData.feePercentage / 100).toFixed(4)
    : '0.0000'

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Escrow Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => updateFormData({ amount: e.target.value })}
            placeholder="0.00"
            min="0"
            step="0.0001"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white placeholder:text-gray-400 ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
          Token / Currency
        </label>
        <select
          id="token"
          value={formData.token}
          onChange={(e) => updateFormData({ token: e.target.value as TokenType })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white"
        >
          <option value={TokenType.USDC}>USDC</option>
          <option value={TokenType.ETH}>ETH</option>
          <option value={TokenType.MATIC}>MATIC</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select the cryptocurrency for this escrow
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Platform / Escrow Fee</label>
          <span className="text-sm font-semibold text-gray-900">{formData.feePercentage}%</span>
        </div>
        {formData.amount && (
          <div className="text-sm text-gray-600">
            <p>Fee Amount: {feeAmount} {formData.token}</p>
            <p className="mt-1">
              Total Amount: {(parseFloat(formData.amount) + parseFloat(feeAmount)).toFixed(4)} {formData.token}
            </p>
          </div>
        )}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Fee Paid By</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="feePaidBy"
                value="payer"
                checked={formData.feePaidBy === 'payer'}
                onChange={(e) => updateFormData({ feePaidBy: e.target.value as 'payer' | 'payee' })}
                className="mr-2 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Payer (You)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="feePaidBy"
                value="payee"
                checked={formData.feePaidBy === 'payee'}
                onChange={(e) => updateFormData({ feePaidBy: e.target.value as 'payer' | 'payee' })}
                className="mr-2 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Payee</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="fundingDeadline" className="block text-sm font-medium text-gray-700 mb-2">
          Funding Deadline (Optional)
        </label>
        <input
          type="datetime-local"
          id="fundingDeadline"
          value={formData.fundingDeadline}
          onChange={(e) => updateFormData({ fundingDeadline: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white"
        />
        <p className="mt-1 text-sm text-gray-500">
          Set a deadline for funding the escrow (optional)
        </p>
      </div>
    </div>
  )
}

