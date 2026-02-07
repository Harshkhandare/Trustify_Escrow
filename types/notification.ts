export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  link?: string | null
  metadata?: string | null
  createdAt: string
}


