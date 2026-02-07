import type { EscrowFormData } from '@/types/escrowForm'

export function safeJsonParse(input: string | null | undefined): any | null {
  if (!input) return null
  try {
    return JSON.parse(input)
  } catch {
    return null
  }
}

export function applyTemplateDefaults(
  current: EscrowFormData,
  defaults: Record<string, any>
): Partial<EscrowFormData> {
  // Only allow known keys to be applied
  const allowedKeys: Array<keyof EscrowFormData> = [
    'title',
    'type',
    'payeeAddress',
    'amount',
    'token',
    'feePercentage',
    'feePaidBy',
    'fundingDeadline',
    'releaseCondition',
    'autoReleaseTime',
    'milestones',
    'description',
    'deliverables',
    'disputeWindow',
    'disputeResolver',
    'termsAccepted',
  ]

  const updates: Partial<EscrowFormData> = {}
  for (const key of allowedKeys) {
    if (defaults[key] !== undefined) {
      ;(updates as any)[key] = defaults[key]
    }
  }

  // Never overwrite payerAddress from template
  delete (updates as any).payerAddress

  // Keep existing title if template doesn't provide one
  if (updates.title === undefined) updates.title = current.title

  return updates
}


