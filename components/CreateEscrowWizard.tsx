'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter, useSearchParams } from 'next/navigation'
import { EscrowFormData, initialFormData, EscrowType, TokenType, ReleaseCondition, Milestone } from '@/types/escrowForm'
import { DEMO_WALLET_ADDRESS } from '@/utils/demoWallet'
import { Step1Basics } from './wizard/Step1Basics'
import { Step2Parties } from './wizard/Step2Parties'
import { Step3Payment } from './wizard/Step3Payment'
import { Step4Release } from './wizard/Step4Release'
import { Step5Work } from './wizard/Step5Work'
import { Step6Dispute } from './wizard/Step6Dispute'
import { Step7Review } from './wizard/Step7Review'
import { fetchTemplateById } from '@/lib/api'
import { applyTemplateDefaults, safeJsonParse } from '@/lib/templateDefaults'

const TOTAL_STEPS = 7

export function CreateEscrowWizard() {
  const { address } = useAccount()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EscrowFormData>({
    ...initialFormData,
    payerAddress: address || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null)
  const [appliedDemo, setAppliedDemo] = useState(false)

  const ERROR_META: Record<string, { step: number; label: string }> = {
    title: { step: 1, label: 'Escrow title' },
    type: { step: 1, label: 'Escrow type' },
    payerAddress: { step: 2, label: 'Payer wallet address' },
    payeeAddress: { step: 2, label: 'Payee wallet address' },
    amount: { step: 3, label: 'Amount' },
    releaseCondition: { step: 4, label: 'Release condition' },
    autoReleaseTime: { step: 4, label: 'Auto-release time' },
    milestones: { step: 4, label: 'Milestones' },
    description: { step: 5, label: 'Work description' },
    disputeWindow: { step: 6, label: 'Dispute window' },
    termsAccepted: { step: 7, label: 'Accept terms' },
  }

  const uid = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  const buildDemoData = (payerAddr: string): Partial<EscrowFormData> => {
    const payeeAddr = '0x1111111111111111111111111111111111111111'
    const now = Date.now()
    const fundingDeadline = new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days

    const amount = '1.00'
    const m1 = '0.50'
    const m2 = '0.50'

    return {
      // Step 1
      title: `Demo Escrow - Landing Page (${new Date().toLocaleDateString()})`,
      type: EscrowType.MILESTONE,

      // Step 2
      payerAddress: payerAddr,
      payeeAddress: payeeAddr,

      // Step 3
      amount,
      token: TokenType.USDC,
      feePercentage: 1,
      feePaidBy: 'payer',
      fundingDeadline,

      // Step 4
      releaseCondition: ReleaseCondition.MILESTONE,
      autoReleaseTime: '',
      milestones: [
        {
          id: uid(),
          title: 'Milestone 1: Design + Wireframe',
          description: 'Initial design + wireframe approval',
          amount: m1,
          dueDate: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString(),
        },
        {
          id: uid(),
          title: 'Milestone 2: Final Delivery',
          description: 'Final landing page delivered + QA',
          amount: m2,
          dueDate: new Date(now + 1000 * 60 * 60 * 24 * 14).toISOString(),
        },
      ],

      // Step 5
      description:
        'Build a responsive landing page with SEO basics, contact section, and a simple FAQ.\n\nAcceptance:\n- Mobile + desktop responsive\n- Lighthouse performance >= 85\n- Deployed preview link',
      deliverables: 'Figma link, deployed preview URL, and source code repo link',

      // Step 6
      disputeWindow: 7,
      disputeResolver: 'platform-admin',

      // Step 7
      termsAccepted: true,
    }
  }

  // Update payer address - use demo wallet or connected wallet
  useEffect(() => {
    const payerAddr = address || DEMO_WALLET_ADDRESS
    setFormData(prev => ({ ...prev, payerAddress: payerAddr }))
  }, [address])

  // Apply template from URL (?templateId=...)
  useEffect(() => {
    const templateId = searchParams.get('templateId')
    if (!templateId) return
    if (appliedTemplateId === templateId) return

    let mounted = true
    ;(async () => {
      try {
        const { template } = await fetchTemplateById(templateId)
        if (!mounted) return

        const defaults = safeJsonParse(template.defaultData)
        if (!defaults || typeof defaults !== 'object') {
          const { default: toast } = await import('react-hot-toast')
          toast.error('Template has invalid default data')
          return
        }

        setFormData((prev) => ({ ...prev, ...applyTemplateDefaults(prev, defaults) }))
        setErrors({})
        setAppliedTemplateId(templateId)
        const { default: toast } = await import('react-hot-toast')
        toast.success(`Applied template: ${template.name}`)
      } catch {
        const { default: toast } = await import('react-hot-toast')
        toast.error('Failed to apply template')
      }
    })()

    return () => {
      mounted = false
    }
  }, [searchParams, appliedTemplateId])

  // Apply demo data from URL (?demo=1) — useful for quick testing
  useEffect(() => {
    const demo = searchParams.get('demo')
    if (demo !== '1') return
    if (appliedDemo) return

    const payerAddr = address || DEMO_WALLET_ADDRESS
    const demoData = buildDemoData(payerAddr)
    setFormData((prev) => ({ ...prev, ...demoData, payerAddress: payerAddr }))
    setErrors({})
    setAppliedDemo(true)
    setCurrentStep(1)
  }, [searchParams, appliedDemo, address])

  const handleFillDemoData = async () => {
    const payerAddr = address || DEMO_WALLET_ADDRESS
    const demoData = buildDemoData(payerAddr)
    setFormData((prev) => ({ ...prev, ...demoData, payerAddress: payerAddr }))
    setErrors({})
    setCurrentStep(1)
    const { default: toast } = await import('react-hot-toast')
    toast.success('Demo data filled. You can click Next through the steps or submit on Review.')
  }

  const updateFormData = (updates: Partial<EscrowFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear only the errors for fields being updated (keep the rest)
    const keys = Object.keys(updates) as Array<keyof EscrowFormData>
    if (keys.length > 0) {
      setErrors((prev) => {
        if (Object.keys(prev).length === 0) return prev
        const next = { ...prev }
        for (const k of keys) delete next[k as string]
        if (keys.includes('milestones')) delete next.milestones
        return next
      })
    }
  }

  const validateStep = (step: number): Record<string, string> => {
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

    return newErrors
  }

  const handleNext = async () => {
    if (currentStep >= TOTAL_STEPS) return

    const stepErrors = validateStep(currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }))
      const { default: toast } = await import('react-hot-toast')
      toast.error('Please fix the highlighted fields to continue.')
      return
    }

    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const validateAllSteps = (): Record<string, string> => {
    const all: Record<string, string> = {}
    for (let step = 1; step <= TOTAL_STEPS; step++) {
      Object.assign(all, validateStep(step))
    }
    return all
  }

  const getFirstErrorStep = (errs: Record<string, string>): number | null => {
    const keys = Object.keys(errs).filter((k) => k !== 'submit')
    let minStep = Number.POSITIVE_INFINITY
    for (const key of keys) {
      const meta = ERROR_META[key]
      if (meta?.step && meta.step < minStep) minStep = meta.step
    }
    return Number.isFinite(minStep) ? minStep : null
  }

  const stepHasErrors = (step: number) => {
    for (const key of Object.keys(errors)) {
      if (ERROR_META[key]?.step === step) return true
    }
    return false
  }

  const errorListForReview = Object.entries(errors)
    .filter(([key]) => key !== 'submit' && key !== 'termsAccepted')
    .map(([key, message]) => ({
      key,
      message,
      step: ERROR_META[key]?.step,
      label: ERROR_META[key]?.label || key,
    }))
    .filter((e) => typeof e.step === 'number')
    .sort((a, b) => (a.step! - b.step!))

  const handleSubmit = async () => {
    const allErrors = validateAllSteps()
    if (Object.keys(allErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...allErrors }))
      const firstStep = getFirstErrorStep(allErrors)
      if (firstStep) {
        setCurrentStep(firstStep)
        if (typeof window !== 'undefined') {
          requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
        }
      }
      const { default: toast } = await import('react-hot-toast')
      toast.error('Some required fields are missing. Please fix the highlighted inputs.')
      return
    }

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
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">Create Escrow</h2>
            <button
              type="button"
              onClick={handleFillDemoData}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Fill Demo Data
            </button>
          </div>
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
              <span className="inline-flex items-center gap-1">
                {step}
                {stepHasErrors(step) && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" aria-label="Step has errors" />
                )}
              </span>
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
            issueList={errorListForReview}
            onGoToStep={(step) => {
              setCurrentStep(step)
              if (typeof window !== 'undefined') {
                requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
              }
            }}
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

