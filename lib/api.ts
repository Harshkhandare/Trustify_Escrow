// API client utilities for escrow operations

import { Escrow, EscrowStatus } from '@/types/escrow'
import { EscrowFormData } from '@/types/escrowForm'
import type { EscrowTemplate } from '@/types/template'
import type { Notification } from '@/types/notification'

const API_BASE = '/api'

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
      }
      
      const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`
      const error = new Error(errorMessage)
      ;(error as any).status = response.status
      ;(error as any).data = errorData
      throw error
    }

    return response.json()
  } catch (err) {
    // Re-throw if it's already our error
    if (err instanceof Error && (err as any).status) {
      throw err
    }
    
    // Network or other errors
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.')
    }
    
    throw err
  }
}

// Get all escrows
export async function fetchEscrows(options?: {
  address?: string
  status?: EscrowStatus
  q?: string
  sortBy?: string
  page?: number
  limit?: number
}): Promise<{ escrows: Escrow[]; pagination: any }> {
  const params = new URLSearchParams()
  if (options?.address) params.append('address', options.address)
  if (options?.status) params.append('status', options.status)
  if (options?.q) params.append('q', options.q)
  if (options?.sortBy) params.append('sortBy', options.sortBy)
  if (options?.page) params.append('page', options.page.toString())
  if (options?.limit) params.append('limit', options.limit.toString())

  const query = params.toString()
  const url = query ? `/escrows?${query}` : '/escrows'

  return fetchAPI(url)
}

// Get escrow by ID
export async function fetchEscrowById(id: string): Promise<Escrow> {
  const data = await fetchAPI<{ escrow: Escrow }>(`/escrows/${id}`)
  return data.escrow
}

// Create escrow
export async function createEscrow(formData: EscrowFormData): Promise<Escrow> {
  const data = await fetchAPI<{ escrow: Escrow }>('/escrows', {
    method: 'POST',
    body: JSON.stringify(formData),
  })
  return data.escrow
}

// Update escrow
export async function updateEscrow(
  id: string,
  updates: Partial<Escrow> | { action: 'fund' | 'release' | 'refund' | 'dispute' }
): Promise<Escrow> {
  const data = await fetchAPI<{ escrow: Escrow }>(`/escrows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.escrow
}

// Delete escrow
export async function deleteEscrow(id: string): Promise<void> {
  await fetchAPI(`/escrows/${id}`, { method: 'DELETE' })
}

// Auth API
export async function login(
  email: string,
  password: string,
  options?: { twoFactorCode?: string; backupCode?: string }
) {
  const response = await fetchAPI<{ user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, ...options }),
  })
  return response
}

export async function signup(name: string, email: string, password: string) {
  return fetchAPI<{ user: any }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, confirmPassword: password }),
  })
}

export async function logout() {
  return fetchAPI('/auth/logout', { method: 'POST' })
}

export async function getCurrentUser() {
  try {
    const data = await fetchAPI<{ user: any }>('/auth/me')
    return data.user
  } catch {
    return null
  }
}

// Templates API
export async function fetchTemplates(options?: {
  publicOnly?: boolean
}): Promise<{ templates: EscrowTemplate[] }> {
  const params = new URLSearchParams()
  if (options?.publicOnly) params.set('public', 'true')
  const qs = params.toString()
  return fetchAPI(qs ? `/templates?${qs}` : '/templates')
}

export async function createTemplate(payload: {
  name: string
  description?: string
  type: string
  defaultData?: Record<string, any>
  isPublic?: boolean
}): Promise<{ template: EscrowTemplate }> {
  return fetchAPI('/templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteTemplate(id: string): Promise<void> {
  await fetchAPI(`/templates/${id}`, { method: 'DELETE' })
}

export async function fetchTemplateById(id: string): Promise<{ template: EscrowTemplate }> {
  return fetchAPI(`/templates/${id}`)
}

// Notifications API
export async function fetchNotifications(options?: {
  unreadOnly?: boolean
  limit?: number
}): Promise<{ notifications: Notification[] }> {
  const params = new URLSearchParams()
  if (options?.unreadOnly) params.set('unread', 'true')
  if (options?.limit) params.set('limit', options.limit.toString())
  const qs = params.toString()
  return fetchAPI(qs ? `/notifications?${qs}` : '/notifications')
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetchAPI('/notifications', { method: 'PATCH' })
}

export async function markNotificationRead(id: string): Promise<{ notification: Notification }> {
  return fetchAPI(`/notifications/${id}`, { method: 'PATCH' })
}

export async function deleteNotification(id: string): Promise<void> {
  await fetchAPI(`/notifications/${id}`, { method: 'DELETE' })
}

export async function resendVerificationEmail(): Promise<{ message: string }> {
  return fetchAPI('/auth/resend-verification', { method: 'POST' })
}

