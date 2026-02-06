'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { LoginForm } from '@/components/LoginForm'
import { SignupForm } from '@/components/SignupForm'
import { isAuthenticated, getSession } from '@/utils/auth'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { isConnected } = useAccount()
  const router = useRouter()
  const [userLoggedIn, setUserLoggedIn] = useState(false)

  // Clear any query parameters from URL (prevents GET submission issues)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const url = new URL(window.location.href)
      if (url.searchParams.has('email') || url.searchParams.has('password')) {
        // Remove query parameters and replace URL without reload
        window.history.replaceState({}, '', '/login')
      }
    }
  }, [])

  // Check if user is logged in (email/password)
  useEffect(() => {
    const checkAuth = () => {
      const user = getSession()
      setUserLoggedIn(!!user)
    }
    checkAuth()
    
    // Check periodically for auth changes
    const interval = setInterval(checkAuth, 1000)
    return () => clearInterval(interval)
  }, [])

  // Redirect to dashboard if wallet is connected
  useEffect(() => {
    if (isConnected && userLoggedIn) {
      router.push('/dashboard')
    }
  }, [router, isConnected, userLoggedIn])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">Escrow Platform</h1>
            <p className="text-gray-600">Secure escrow transactions</p>
          </div>

          {!userLoggedIn ? (
            <>
              {/* Login/Signup Toggle */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                    isLogin
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                    !isLogin
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Login or Signup Form */}
              {isLogin ? (
                <LoginForm key="login-form" />
              ) : (
                <SignupForm 
                  key="signup-form"
                  onSuccess={() => setIsLogin(true)} 
                />
              )}
            </>
          ) : (
            <>
              {/* Show wallet connection after login */}
              <div className="text-center mb-6">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Login Successful!</h2>
                  <p className="text-sm text-gray-600">Now connect your wallet to continue</p>
                </div>
              </div>

              {/* Auto-connect to Dashboard */}
              <div className="mb-6">
                <div className="text-center">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition w-full"
                  >
                    Connect Wallet & Go to Dashboard
                  </button>
                  <p className="mt-3 text-sm text-gray-500">
                    Demo wallet will be auto-connected
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-primary-600 hover:text-primary-700 hover:underline text-sm"
                >
                  Continue to Home →
                </Link>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </main>
  )
}

