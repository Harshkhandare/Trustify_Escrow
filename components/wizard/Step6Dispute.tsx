'use client'

import { EscrowFormData } from '@/types/escrowForm'

interface Step6DisputeProps {
  formData: EscrowFormData
  updateFormData: (updates: Partial<EscrowFormData>) => void
  errors: Record<string, string>
}

export function Step6Dispute({ formData, updateFormData, errors }: Step6DisputeProps) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="disputeWindow" className="block text-sm font-medium text-gray-700 mb-2">
          Dispute Window (Days)
        </label>
        <input
          type="number"
          id="disputeWindow"
          value={formData.disputeWindow}
          onChange={(e) => updateFormData({ disputeWindow: parseInt(e.target.value) || 3 })}
          min="1"
          max="30"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white ${
            errors.disputeWindow ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.disputeWindow && (
          <p className="mt-1 text-sm text-red-600">{errors.disputeWindow}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Number of days after payment release that disputes can be raised (default: 3 days)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Dispute Resolver
        </label>
        <div className="space-y-3">
          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="disputeResolver"
              value="platform-admin"
              checked={formData.disputeResolver === 'platform-admin'}
              onChange={(e) => updateFormData({ disputeResolver: e.target.value })}
              className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <div className="font-medium text-gray-900">Platform Admin (Default)</div>
              <div className="text-sm text-gray-600 mt-1">
                Platform administrators will review and resolve disputes
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition opacity-50">
            <input
              type="radio"
              name="disputeResolver"
              value="third-party-arbiter"
              checked={formData.disputeResolver === 'third-party-arbiter'}
              onChange={(e) => updateFormData({ disputeResolver: e.target.value })}
              className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
              disabled
            />
            <div>
              <div className="font-medium text-gray-900">Third-Party Arbiter</div>
              <div className="text-sm text-gray-600 mt-1">
                Designated third-party arbiter (Coming soon)
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Dispute Protection</p>
            <p>All disputes are reviewed fairly. The dispute window gives both parties time to raise concerns after payment release.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

