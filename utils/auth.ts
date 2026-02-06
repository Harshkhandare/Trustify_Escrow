// Authentication utilities
// Note: This is a client-side implementation using localStorage
// For production, replace with a proper backend authentication service

export interface User {
  id: string
  name: string
  email: string
  walletAddress?: string
  createdAt: number
}

const STORAGE_KEY = 'escrow_users'
const SESSION_KEY = 'escrow_session'

// Get all users from storage
function getUsers(): User[] {
  if (typeof window === 'undefined') return []
  const usersJson = localStorage.getItem(STORAGE_KEY)
  return usersJson ? JSON.parse(usersJson) : []
}

// Save users to storage
function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

// Hash password (simple implementation - use proper hashing in production)
function hashPassword(password: string): string {
  // In production, use a proper hashing library like bcrypt
  return btoa(password) // Base64 encoding (NOT secure for production!)
}

// Verify password
function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash
}

// Sign up a new user
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<boolean> {
  const users = getUsers()
  
  // Check if user already exists
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return false
  }

  // Create new user
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    email: email.toLowerCase(),
    createdAt: Date.now(),
  }

  // Store user with hashed password
  const userData = {
    ...newUser,
    passwordHash: hashPassword(password),
  }

  users.push(userData as any)
  saveUsers(users)

  // Auto-login after signup
  setSession(newUser)
  
  return true
}

// Login user
export async function login(email: string, password: string): Promise<boolean> {
  const users = getUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase()) as any

  if (!user || !user.passwordHash) {
    return false
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return false
  }

  // Remove password hash before setting session
  const { passwordHash, ...userWithoutPassword } = user
  setSession(userWithoutPassword)

  return true
}

// Logout user
export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

// Get current session
export function getSession(): User | null {
  if (typeof window === 'undefined') return null
  const sessionJson = localStorage.getItem(SESSION_KEY)
  return sessionJson ? JSON.parse(sessionJson) : null
}

// Set session
function setSession(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getSession() !== null
}

// Update user wallet address
export function updateUserWallet(walletAddress: string): void {
  const session = getSession()
  if (!session) return

  const users = getUsers()
  const userIndex = users.findIndex(u => u.id === session.id)
  
  if (userIndex !== -1) {
    users[userIndex].walletAddress = walletAddress
    saveUsers(users)
    
    // Update session
    const updatedUser = { ...session, walletAddress }
    setSession(updatedUser)
  }
}

// Get user by ID
export function getUserById(id: string): User | null {
  const users = getUsers()
  const user = users.find(u => u.id === id) as any
  if (!user) return null
  
  const { passwordHash, ...userWithoutPassword } = user
  return userWithoutPassword
}

