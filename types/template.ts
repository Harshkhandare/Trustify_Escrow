export interface EscrowTemplate {
  id: string
  name: string
  description?: string | null
  type: string
  defaultData?: string | null
  isPublic: boolean
  createdBy?: string | null
  createdAt: string
  updatedAt: string
}


