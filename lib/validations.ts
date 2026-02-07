import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const walletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address')

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const createEscrowSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['one-time', 'milestone', 'time-locked']),
  payerAddress: walletAddressSchema,
  payeeAddress: walletAddressSchema,
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount'),
  token: z.enum(['USDC', 'ETH', 'MATIC']),
  feePercentage: z.number().min(0).max(100),
  feePaidBy: z.enum(['payer', 'payee']),
  fundingDeadline: z.string().optional(),
  releaseCondition: z.enum(['manual', 'auto-time', 'milestone']),
  autoReleaseTime: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  deliverables: z.string().optional(),
  disputeWindow: z.number().min(1).max(30),
  disputeResolver: z.string(),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string(),
    amount: z.string(),
    dueDate: z.string(),
  })).optional(),
}).refine((data) => {
  if (data.payerAddress.toLowerCase() === data.payeeAddress.toLowerCase()) {
    return false
  }
  return true
}, {
  message: 'Payer and payee addresses must be different',
  path: ['payeeAddress'],
})


