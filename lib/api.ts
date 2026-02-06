// API client utilities for escrow operations

import { Escrow, EscrowStatus } from '@/types/escrow'
import { EscrowFormData } from '@/types/escrowForm'

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
  page?: number
  limit?: number
}): Promise<{ escrows: Escrow[]; pagination: any }> {
  const params = new URLSearchParams()
  if (options?.address) params.append('address', options.address)
  if (options?.status) params.append('status', options.status)
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
export async function login(email: string, password: string) {
  const response = await fetchAPI<{ user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
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

