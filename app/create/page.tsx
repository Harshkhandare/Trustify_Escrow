'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreateEscrowWizard } from '@/components/CreateEscrowWizard'
import { isAuthenticated, getSession } from '@/utils/auth'

export default function CreateEscrowPage() {
  const router = useRouter()
  const [user, setUser] = useState(getSession())
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    setUser(getSession())
    const authenticated = isAuthenticated()
    
    if (!authenticated) {
      router.push('/login')
    } else {
      setIsChecking(false)
    }
  }, [router])

  if (isChecking) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  // Require login - demo wallet is handled by the wizard
  if (!user) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <h1 className="text-4xl font-bold mb-4">Create Escrow</h1>
            <p className="text-xl text-gray-600 mb-4">
              You need to login to create an escrow
            </p>
            <Link
              href="/login"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Go to Login
            </Link>
            <div className="mt-8">
              <Link
                href="/"
                className="text-primary-600 hover:underline"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View Dashboard
          </Link>
        </div>

        <CreateEscrowWizard />
      </div>
    </main>
  )
}

