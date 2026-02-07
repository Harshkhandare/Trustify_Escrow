'use client'

import { EscrowFormData, EscrowType } from '@/types/escrowForm'
import { TemplatePicker } from '@/components/TemplatePicker'

interface Step1BasicsProps {
  formData: EscrowFormData
  updateFormData: (updates: Partial<EscrowFormData>) => void
  errors: Record<string, string>
}

export function Step1Basics({ formData, updateFormData, errors }: Step1BasicsProps) {
  return (
    <div className="space-y-6">
      <TemplatePicker
        currentFormData={formData}
        onApply={(updates) => updateFormData(updates)}
      />

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Escrow Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="e.g., Website Development Project"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white placeholder:text-gray-400 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Give your escrow a clear, descriptive title
        </p>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          Escrow Type <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => updateFormData({ type: e.target.value as EscrowType })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select escrow type...</option>
          <option value={EscrowType.ONE_TIME}>One-time payment</option>
          <option value={EscrowType.MILESTONE}>Milestone-based</option>
          <option value={EscrowType.TIME_LOCKED}>Time-locked</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type}</p>
        )}
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="font-medium">One-time payment:</span>
            <span>Single payment released when conditions are met</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Milestone-based:</span>
            <span>Payments released as milestones are completed</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">Time-locked:</span>
            <span>Automatic release after a specified time period</span>
          </div>
        </div>
      </div>
    </div>
  )
}


