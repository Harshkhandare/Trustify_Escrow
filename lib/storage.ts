// Simple file-based storage for escrows
// Can be easily upgraded to a database later

import { Escrow, EscrowStatus } from '@/types/escrow'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const ESCROWS_FILE = path.join(DATA_DIR, 'escrows.json')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Read escrows from file
export async function getEscrows(): Promise<Escrow[]> {
  await ensureDataDir()
  
  try {
    const data = await fs.readFile(ESCROWS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    // File doesn't exist, return empty array
    return []
  }
}

// Save escrows to file
export async function saveEscrows(escrows: Escrow[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(ESCROWS_FILE, JSON.stringify(escrows, null, 2), 'utf-8')
}

// Get escrow by ID
export async function getEscrowById(id: string): Promise<Escrow | null> {
  const escrows = await getEscrows()
  return escrows.find(e => e.id === id) || null
}

// Create new escrow
export async function createEscrow(escrow: Escrow): Promise<Escrow> {
  const escrows = await getEscrows()
  escrows.push(escrow)
  await saveEscrows(escrows)
  return escrow
}

// Update escrow
export async function updateEscrow(id: string, updates: Partial<Escrow>): Promise<Escrow | null> {
  const escrows = await getEscrows()
  const index = escrows.findIndex(e => e.id === id)
  
  if (index === -1) {
    return null
  }
  
  escrows[index] = { ...escrows[index], ...updates }
  await saveEscrows(escrows)
  return escrows[index]
}

// Delete escrow
export async function deleteEscrow(id: string): Promise<boolean> {
  const escrows = await getEscrows()
  const filtered = escrows.filter(e => e.id !== id)
  
  if (filtered.length === escrows.length) {
    return false // Escrow not found
  }
  
  await saveEscrows(filtered)
  return true
}


