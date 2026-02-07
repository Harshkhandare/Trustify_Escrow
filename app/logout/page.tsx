'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/utils/auth'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    logout()
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Logging out...</p>
    </div>
  )
}


