export interface Escrow {
  id: string
  buyer: string
  seller: string
  arbiter: string
  amount: string
  token: string // USDC, ETH, MATIC
  status: EscrowStatus
  createdAt: number
  description?: string
  title?: string
  type?: string // one-time, milestone, time-locked
  feePercentage?: number
  feePaidBy?: 'payer' | 'payee'
  fundingDeadline?: string
  releaseCondition?: string
  autoReleaseTime?: string
  milestones?: Array<{
    id: string
    title: string
    description: string
    amount: string
    dueDate: string
  }>
  deliverables?: string
  disputeWindow?: number
  disputeResolver?: string
  fundedAt?: number
  releasedAt?: number
  refundedAt?: number
  disputedAt?: number
  activities?: Array<{
    id: string
    type: string
    message: string
    createdAt: string
    userId?: string
    metadata?: any
  }>
}

export enum EscrowStatus {
  PENDING = 'PENDING',
  FUNDED = 'FUNDED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export interface CreateEscrowParams {
  seller: string
  arbiter: string
  amount: string
  description?: string
}

