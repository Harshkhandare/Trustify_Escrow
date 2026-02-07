'use client'

import { EscrowFormData } from '@/types/escrowForm'

interface Step5WorkProps {
  formData: EscrowFormData
  updateFormData: (updates: Partial<EscrowFormData>) => void
  errors: Record<string, string>
}

export function Step5Work({ formData, updateFormData, errors }: Step5WorkProps) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Work Description / Scope <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe the work, project scope, deliverables, and any specific requirements..."
          rows={8}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white placeholder:text-gray-400 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Provide a detailed description of the work to be completed
        </p>
      </div>

      <div>
        <label htmlFor="deliverables" className="block text-sm font-medium text-gray-700 mb-2">
          Deliverables / Proof Required (Optional)
        </label>
        <textarea
          id="deliverables"
          value={formData.deliverables}
          onChange={(e) => updateFormData({ deliverables: e.target.value })}
          placeholder="List specific deliverables, files, links, or proof of completion required..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white placeholder:text-gray-400"
        />
        <p className="mt-1 text-sm text-gray-500">
          Specify what proof or deliverables are needed before payment release
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Tip:</p>
            <p>Be as specific as possible. Clear deliverables help prevent disputes and ensure smooth payment release.</p>
          </div>
        </div>
      </div>
    </div>
  )
}


