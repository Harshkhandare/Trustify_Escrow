'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import toast from 'react-hot-toast'
import { Button } from './ui/Button'

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Prevent double submission
    if (isLoading) return
    
    setIsLoading(true)
    
    // Safety timeout - reset loading state after 30 seconds
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
      setError('Request timed out. Please try again.')
      toast.error('Request timed out. Please check your connection.')
    }, 30000)

    try {
      const response = await login(formData.email, formData.password)
      
      if (!response || !response.user) {
        throw new Error('Invalid response from server')
      }
      
      const user = response.user
      
      // Store user in localStorage for compatibility with existing code
      if (typeof window !== 'undefined' && user) {
        localStorage.setItem('escrow_session', JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress,
          createdAt: Date.now(),
        }))
      }
      
      clearTimeout(timeoutId)
      toast.success('Login successful!')
      // Small delay to ensure localStorage is saved, then redirect
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
    } catch (err: any) {
      clearTimeout(timeoutId)
      console.error('Login error:', err)
      let errorMsg = 'Login failed. Please try again.'
      
      if (err instanceof Error) {
        errorMsg = err.message
      } else if (err?.error) {
        errorMsg = err.error
      } else if (typeof err === 'string') {
        errorMsg = err
      }
      
      // Check for database connection errors
      if (errorMsg.includes('Database connection') || errorMsg.includes('P1001') || errorMsg.includes('Can\'t reach database')) {
        errorMsg = 'Database not configured. Please set up your database first. See README for instructions.'
      }
      
      setError(errorMsg)
      toast.error(errorMsg)
      setIsLoading(false) // Ensure loading state is reset
    }
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit(e)
        return false
      }} 
      method="POST" 
      action="#" 
      className="space-y-4"
      noValidate
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white placeholder:text-gray-400"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition pr-12 text-gray-900 bg-white placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        <a
          href="/forgot-password"
          className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
        >
          Forgot password?
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Sign In
      </Button>
    </form>
  )
}

