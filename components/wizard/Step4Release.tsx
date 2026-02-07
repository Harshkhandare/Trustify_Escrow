'use client'

import { useState } from 'react'
import { EscrowFormData, ReleaseCondition, Milestone } from '@/types/escrowForm'

interface Step4ReleaseProps {
  formData: EscrowFormData
  updateFormData: (updates: Partial<EscrowFormData>) => void
  errors: Record<string, string>
}

export function Step4Release({ formData, updateFormData, errors }: Step4ReleaseProps) {
  const [milestoneForm, setMilestoneForm] = useState<Milestone>({
    id: '',
    title: '',
    description: '',
    amount: '',
    dueDate: '',
  })

  const addMilestone = () => {
    if (!milestoneForm.title || !milestoneForm.amount || !milestoneForm.dueDate) {
      return
    }

    const newMilestone: Milestone = {
      ...milestoneForm,
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    updateFormData({
      milestones: [...formData.milestones, newMilestone],
    })

    setMilestoneForm({
      id: '',
      title: '',
      description: '',
      amount: '',
      dueDate: '',
    })
  }

  const removeMilestone = (id: string) => {
    updateFormData({
      milestones: formData.milestones.filter(m => m.id !== id),
    })
  }

  const totalMilestoneAmount = formData.milestones.reduce(
    (sum, m) => sum + parseFloat(m.amount || '0'),
    0
  )
  const escrowAmount = parseFloat(formData.amount || '0')

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Release Condition <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="releaseCondition"
              value={ReleaseCondition.MANUAL}
              checked={formData.releaseCondition === ReleaseCondition.MANUAL}
              onChange={(e) => updateFormData({ releaseCondition: e.target.value as ReleaseCondition })}
              className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <div className="font-medium text-gray-900">Manual approval by payer</div>
              <div className="text-sm text-gray-600 mt-1">
                You manually approve each payment release
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="releaseCondition"
              value={ReleaseCondition.AUTO_TIME}
              checked={formData.releaseCondition === ReleaseCondition.AUTO_TIME}
              onChange={(e) => updateFormData({ releaseCondition: e.target.value as ReleaseCondition })}
              className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Auto-release after time</div>
              <div className="text-sm text-gray-600 mt-1">
                Automatically release funds after a specified time period
              </div>
              {formData.releaseCondition === ReleaseCondition.AUTO_TIME && (
                <div className="mt-3">
                  <input
                    type="datetime-local"
                    value={formData.autoReleaseTime}
                    onChange={(e) => updateFormData({ autoReleaseTime: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white ${
                      errors.autoReleaseTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.autoReleaseTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.autoReleaseTime}</p>
                  )}
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="releaseCondition"
              value={ReleaseCondition.MILESTONE}
              checked={formData.releaseCondition === ReleaseCondition.MILESTONE}
              onChange={(e) => updateFormData({ releaseCondition: e.target.value as ReleaseCondition })}
              className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Milestone-based release</div>
              <div className="text-sm text-gray-600 mt-1">
                Release funds as milestones are completed
              </div>
            </div>
          </label>
        </div>
        {errors.releaseCondition && (
          <p className="mt-2 text-sm text-red-600">{errors.releaseCondition}</p>
        )}
      </div>

      {/* Milestone Management */}
      {formData.releaseCondition === ReleaseCondition.MILESTONE && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Milestones</h4>
          
          {/* Add Milestone Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Milestone Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  placeholder="e.g., Phase 1: Design"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={milestoneForm.amount}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.0001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                placeholder="Describe what needs to be completed..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={milestoneForm.dueDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={addMilestone}
              disabled={!milestoneForm.title || !milestoneForm.amount || !milestoneForm.dueDate}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Milestone
            </button>
          </div>

          {/* Milestones List */}
          {formData.milestones.length > 0 && (
            <div className="space-y-3">
              {formData.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="font-semibold text-gray-900">{milestone.title}</h5>
                      <span className="text-sm font-medium text-primary-600">
                        {milestone.amount} {formData.token}
                      </span>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                    )}
                    <p className="text-xs text-gray-500">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMilestone(milestone.id)}
                    className="ml-4 text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Milestone Summary */}
          {formData.milestones.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">
                  Total Milestone Amount: {totalMilestoneAmount.toFixed(4)} {formData.token}
                </span>
                <span className={`text-sm font-semibold ${
                  Math.abs(totalMilestoneAmount - escrowAmount) < 0.01
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  Escrow Amount: {escrowAmount.toFixed(4)} {formData.token}
                </span>
              </div>
              {Math.abs(totalMilestoneAmount - escrowAmount) >= 0.01 && (
                <p className="mt-2 text-sm text-red-600">
                  ⚠️ Milestone amounts must equal the escrow amount
                </p>
              )}
            </div>
          )}

          {errors.milestones && (
            <p className="mt-2 text-sm text-red-600">{errors.milestones}</p>
          )}
        </div>
      )}
    </div>
  )
}


