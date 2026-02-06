'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { EscrowFormData, initialFormData, EscrowType, TokenType, ReleaseCondition, Milestone } from '@/types/escrowForm'
import { DEMO_WALLET_ADDRESS } from '@/utils/demoWallet'
import { Step1Basics } from './wizard/Step1Basics'
import { Step2Parties } from './wizard/Step2Parties'
import { Step3Payment } from './wizard/Step3Payment'
import { Step4Release } from './wizard/Step4Release'
import { Step5Work } from './wizard/Step5Work'
import { Step6Dispute } from './wizard/Step6Dispute'
import { Step7Review } from './wizard/Step7Review'

const TOTAL_STEPS = 7

export function CreateEscrowWizard() {
  const { address } = useAccount()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EscrowFormData>({
    ...initialFormData,
    payerAddress: address || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update payer address - use demo wallet or connected wallet
  useEffect(() => {
    const payerAddr = address || DEMO_WALLET_ADDRESS
    setFormData(prev => ({ ...prev, payerAddress: payerAddr }))
  }, [address])

  const updateFormData = (updates: Partial<EscrowFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear errors when user updates field
    setErrors({})
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = 'Escrow title is required'
        }
        if (!formData.type) {
          newErrors.type = 'Please select an escrow type'
        }
        break

      case 2:
        if (!formData.payerAddress) {
          newErrors.payerAddress = 'Payer address is required'
        }
        if (!formData.payeeAddress.trim()) {
          newErrors.payeeAddress = 'Payee address is required'
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.payeeAddress)) {
          newErrors.payeeAddress = 'Invalid wallet address format'
        } else if (formData.payeeAddress.toLowerCase() === formData.payerAddress.toLowerCase()) {
          newErrors.payeeAddress = 'Payee address must be different from payer address'
        }
        break

      case 3:
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
          newErrors.amount = 'Valid amount is required'
        }
        break

      case 4:
        if (!formData.releaseCondition) {
          newErrors.releaseCondition = 'Please select a release condition'
        }
        if (formData.releaseCondition === ReleaseCondition.AUTO_TIME && !formData.autoReleaseTime) {
          newErrors.autoReleaseTime = 'Auto-release time is required'
        }
        if (formData.releaseCondition === ReleaseCondition.MILESTONE) {
          if (formData.milestones.length === 0) {
            newErrors.milestones = 'At least one milestone is required'
          } else {
            const totalMilestoneAmount = formData.milestones.reduce(
              (sum, m) => sum + parseFloat(m.amount || '0'),
              0
            )
            const escrowAmount = parseFloat(formData.amount || '0')
            if (Math.abs(totalMilestoneAmount - escrowAmount) > 0.01) {
              newErrors.milestones = `Total milestone amount (${totalMilestoneAmount}) must equal escrow amount (${escrowAmount})`
            }
          }
        }
        break

      case 5:
        if (!formData.description.trim()) {
          newErrors.description = 'Work description is required'
        }
        break

      case 6:
        if (formData.disputeWindow < 1) {
          newErrors.disputeWindow = 'Dispute window must be at least 1 day'
        }
        break

      case 7:
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = 'You must accept the terms and conditions'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    // Allow proceeding without validation - users can fill data later
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
      // Clear errors when moving to next step
      setErrors({})
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(7)) return

    setIsSubmitting(true)
    try {
      const { createEscrow } = await import('@/lib/api')
      const { default: toast } = await import('react-hot-toast')
      const escrow = await createEscrow(formData)
      toast.success('Escrow created successfully!')
      
      // Redirect to the created escrow details page
      router.push(`/escrows/${escrow.id}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create escrow. Please try again.'
      setErrors({ submit: errorMsg })
      setIsSubmitting(false)
    }
  }

  const getStepTitle = (step: number): string => {
    const titles = [
      'Escrow Basics',
      'Parties Involved',
      'Payment Details',
      'Release Conditions',
      'Work Details',
      'Dispute & Safety',
      'Review & Confirm',
    ]
    return titles[step - 1] || ''
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Create Escrow</h2>
          <span className="text-sm text-gray-600">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={`text-xs ${
                step <= currentStep ? 'text-primary-600 font-semibold' : 'text-gray-400'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">{getStepTitle(currentStep)}</h3>

        {currentStep === 1 && (
          <Step1Basics
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <Step2Parties
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 3 && (
          <Step3Payment
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 4 && (
          <Step4Release
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 5 && (
          <Step5Work
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 6 && (
          <Step6Dispute
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 7 && (
          <Step7Review
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onBack={handleBack}
          />
        )}

        {/* Navigation Buttons - Hidden on Step 7 as it has its own navigation */}
        {currentStep < 7 && (
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition ml-auto"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

