'use client'

import { EscrowFormData, EscrowType, TokenType, ReleaseCondition } from '@/types/escrowForm'
import { formatAddress } from '@/utils/format'

interface Step7ReviewProps {
  formData: EscrowFormData
  updateFormData: (updates: Partial<EscrowFormData>) => void
  errors: Record<string, string>
  onSubmit: () => void
  isSubmitting: boolean
  onBack: () => void
}

export function Step7Review({ formData, updateFormData, errors, onSubmit, isSubmitting, onBack }: Step7ReviewProps) {
  const feeAmount = formData.amount
    ? (parseFloat(formData.amount) * formData.feePercentage / 100).toFixed(4)
    : '0.0000'
  const totalAmount = formData.amount
    ? (parseFloat(formData.amount) + parseFloat(feeAmount)).toFixed(4)
    : '0.0000'

  const getEscrowTypeLabel = (type: EscrowType) => {
    switch (type) {
      case EscrowType.ONE_TIME:
        return 'One-time payment'
      case EscrowType.MILESTONE:
        return 'Milestone-based'
      case EscrowType.TIME_LOCKED:
        return 'Time-locked'
      default:
        return type
    }
  }

  const getReleaseConditionLabel = (condition: ReleaseCondition) => {
    switch (condition) {
      case ReleaseCondition.MANUAL:
        return 'Manual approval by payer'
      case ReleaseCondition.AUTO_TIME:
        return `Auto-release after time (${new Date(formData.autoReleaseTime).toLocaleString()})`
      case ReleaseCondition.MILESTONE:
        return `Milestone-based (${formData.milestones.length} milestones)`
      default:
        return condition
    }
  }

  return (
    <div className="space-y-6">
      {/* Escrow Summary */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Escrow Summary</h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Escrow Title</label>
            <p className="text-gray-900 font-semibold mt-1">{formData.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Escrow Type</label>
            <p className="text-gray-900 font-semibold mt-1">{getEscrowTypeLabel(formData.type as EscrowType)}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Parties</h5>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600">Payer (You)</label>
              <p className="text-sm font-mono text-gray-900">{formatAddress(formData.payerAddress)}</p>
            </div>
            <div>
              <label className="text-xs text-gray-600">Payee</label>
              <p className="text-sm font-mono text-gray-900">{formatAddress(formData.payeeAddress)}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Payment Details</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Escrow Amount:</span>
              <span className="font-semibold text-gray-900">{formData.amount} {formData.token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee ({formData.feePercentage}%):</span>
              <span className="font-semibold text-gray-900">{feeAmount} {formData.token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fee Paid By:</span>
              <span className="font-semibold text-gray-900 capitalize">{formData.feePaidBy}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-900 font-semibold">Total Amount:</span>
              <span className="font-bold text-primary-600">{totalAmount} {formData.token}</span>
            </div>
            {formData.fundingDeadline && (
              <div className="flex justify-between mt-2">
                <span className="text-gray-600">Funding Deadline:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(formData.fundingDeadline).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Release Condition</h5>
          <p className="text-sm text-gray-900">{getReleaseConditionLabel(formData.releaseCondition as ReleaseCondition)}</p>
          {formData.releaseCondition === ReleaseCondition.MILESTONE && formData.milestones.length > 0 && (
            <div className="mt-3 space-y-2">
              {formData.milestones.map((milestone) => (
                <div key={milestone.id} className="bg-white rounded p-2 text-xs">
                  <div className="font-medium text-gray-900">{milestone.title}</div>
                  <div className="text-gray-600">
                    {milestone.amount} {formData.token} - Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Work Description</h5>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{formData.description}</p>
          {formData.deliverables && (
            <div className="mt-3">
              <h6 className="text-xs font-semibold text-gray-700 mb-1">Deliverables:</h6>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{formData.deliverables}</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Dispute Settings</h5>
          <div className="text-sm text-gray-900">
            <p>Dispute Window: {formData.disputeWindow} days</p>
            <p className="mt-1">Resolver: Platform Admin</p>
          </div>
        </div>
      </div>

      {/* Terms Acceptance */}
      <div className="border-t pt-6">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
            className="mt-1 mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">
              I agree to the escrow terms and conditions <span className="text-red-500">*</span>
            </span>
            {errors.termsAccepted && (
              <p className="mt-1 text-sm text-red-600">{errors.termsAccepted}</p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              By creating this escrow, you agree to our Terms of Service and understand that funds will be locked in a smart contract until release conditions are met.
            </p>
          </div>
        </label>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errors.submit}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !formData.termsAccepted}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Escrow...
            </>
          ) : (
            'Create Escrow'
          )}
        </button>
      </div>
    </div>
  )
}

