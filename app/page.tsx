'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { getSession, logout, type User } from '@/utils/auth'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { NotificationsBell } from '@/components/NotificationsBell'

export default function Home() {
  const { isConnected, address } = useAccount()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    setUser(getSession())
  }, [])

  // Note: Demo wallet auto-connects on dashboard page, no redirect needed here

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push('/login')
  }

  // Prevent hydration mismatch by not rendering user-dependent content until mounted
  if (!mounted) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-12">
            <Link href="/" className="text-4xl font-bold text-primary-600 hover:text-primary-700 transition">
              Escrow Platform
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </header>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <Link href="/" className="text-4xl font-bold text-primary-600 hover:text-primary-700 transition">
            Escrow Platform
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Show Create Escrow button when logged in and wallet connected */}
                {isConnected && (
                  <Link
                    href="/create"
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    Create Escrow
                  </Link>
                )}
                <NotificationsBell />
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name && user.name.length > 0 ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-medium text-gray-800">{user.name || 'User'}</span>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user.email || ''}</p>
                      </div>
                      <Link
                        href="/settings/security"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        Security Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Login
              </Link>
            )}
          </div>
        </header>

        {/* Hero Section */}
        {!user ? (
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Welcome to Escrow Platform</h2>
            <p className="text-xl text-gray-600 mb-8">
              Please login to access escrow features
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Login to Continue
              </Link>
            </div>
          </div>
        ) : !isConnected ? (
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Welcome back, {user.name}!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Connect your wallet to view your dashboard and create escrow transactions
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Connect Wallet & View Dashboard
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Demo wallet will be auto-connected
            </p>
          </div>
        ) : (
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Secure Escrow Service</h2>
            <p className="text-xl text-gray-600 mb-8">
              Trusted third-party escrow for secure transactions
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/create"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Create Escrow
              </Link>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p className="text-gray-600">
              Funds are held securely in smart contracts until conditions are met
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Transparent</h3>
            <p className="text-gray-600">
              All transactions are recorded on the blockchain for full transparency
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Decentralized</h3>
            <p className="text-gray-600">
              No central authority, powered by blockchain technology
            </p>
          </div>
        </div>

        {/* Quick Actions - Only show after login */}
        {user && (
          <div className="flex gap-4 justify-center flex-wrap">
            {isConnected && (
              <Link
                href="/create"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Create Escrow
              </Link>
            )}
            <Link
              href="/escrows"
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              View All Escrows
            </Link>
            <Link
              href="/my-escrows"
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              My Escrows
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

