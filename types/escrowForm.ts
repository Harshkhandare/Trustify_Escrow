export enum EscrowType {
  ONE_TIME = 'one-time',
  MILESTONE = 'milestone',
  TIME_LOCKED = 'time-locked',
}

export enum TokenType {
  USDC = 'USDC',
  ETH = 'ETH',
  MATIC = 'MATIC',
}

export enum ReleaseCondition {
  MANUAL = 'manual',
  AUTO_TIME = 'auto-time',
  MILESTONE = 'milestone',
}

export interface Milestone {
  id: string
  title: string
  description: string
  amount: string
  dueDate: string
}

export interface EscrowFormData {
  // Step 1: Basics
  title: string
  type: EscrowType | ''
  
  // Step 2: Parties
  payerAddress: string
  payeeAddress: string
  
  // Step 3: Payment
  amount: string
  token: TokenType
  feePercentage: number
  feePaidBy: 'payer' | 'payee'
  fundingDeadline: string
  
  // Step 4: Release Conditions
  releaseCondition: ReleaseCondition | ''
  autoReleaseTime: string
  milestones: Milestone[]
  
  // Step 5: Work Details
  description: string
  deliverables: string
  
  // Step 6: Dispute
  disputeWindow: number
  disputeResolver: string
  
  // Step 7: Review
  termsAccepted: boolean
}

export const initialFormData: EscrowFormData = {
  title: '',
  type: '',
  payerAddress: '',
  payeeAddress: '',
  amount: '',
  token: TokenType.USDC,
  feePercentage: 1,
  feePaidBy: 'payer',
  fundingDeadline: '',
  releaseCondition: '',
  autoReleaseTime: '',
  milestones: [],
  description: '',
  deliverables: '',
  disputeWindow: 3,
  disputeResolver: 'platform-admin',
  termsAccepted: false,
}

