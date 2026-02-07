'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('Verifying your email…')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Missing verification token.')
      return
    }

    let mounted = true
    setStatus('verifying')

    ;(async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!mounted) return

        if (!res.ok) {
          throw new Error(data.error || 'Verification failed')
        }

        setStatus('success')
        setMessage('Email verified successfully!')
        toast.success('Email verified')
        setTimeout(() => router.push('/dashboard'), 1200)
      } catch (e) {
        if (!mounted) return
        setStatus('error')
        setMessage(e instanceof Error ? e.message : 'Verification failed')
        toast.error('Verification failed')
      }
    })()

    return () => {
      mounted = false
    }
  }, [token, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">Verify Email</h1>
            <p className="text-gray-600 mb-6">{message}</p>

            {status === 'error' && (
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Go to Login
                </Link>
                <p className="text-sm text-gray-500">
                  If you are logged in, you can resend a verification email from your dashboard.
                </p>
              </div>
            )}

            {status === 'success' && (
              <p className="text-sm text-gray-500">
                Redirecting to dashboard…
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}


