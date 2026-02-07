'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { getDemoWalletInfo } from '@/utils/demoWallet'
import { fetchEscrows, getCurrentUser, resendVerificationEmail } from '@/lib/api'
import { Escrow } from '@/types/escrow'
import { NotificationsBell } from '@/components/NotificationsBell'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { isConnected, address } = useAccount()
  const demoWallet = getDemoWalletInfo()
  const [me, setMe] = useState<any>(null)
  const [isResending, setIsResending] = useState(false)
  const [stats, setStats] = useState({
    escrowsCreated: 0,
    escrowsParticipated: 0,
    totalVolume: 0,
    pendingEscrows: 0,
    fundedEscrows: 0,
    completedEscrows: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recentEscrows, setRecentEscrows] = useState<Escrow[]>([])

  const walletAddress = (isConnected && address) || demoWallet.address

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!walletAddress) return

      try {
        setIsLoading(true)
        const data = await fetchEscrows({ address: walletAddress, limit: 100 })

        // Calculate statistics
        const created = data.escrows.filter(e => e.buyer?.toLowerCase() === walletAddress.toLowerCase())
        const participated = data.escrows.filter(e => 
          e.buyer?.toLowerCase() === walletAddress.toLowerCase() ||
          e.seller?.toLowerCase() === walletAddress.toLowerCase() ||
          e.arbiter?.toLowerCase() === walletAddress.toLowerCase()
        )

        const totalVolume = data.escrows.reduce((sum, e) => {
          const amount = parseFloat(e.amount) || 0
          return sum + amount
        }, 0)

        const pending = data.escrows.filter(e => e.status === 'PENDING').length
        const funded = data.escrows.filter(e => e.status === 'FUNDED').length
        const completed = data.escrows.filter(e => 
          e.status === 'RELEASED' || e.status === 'REFUNDED'
        ).length

        setStats({
          escrowsCreated: created.length,
          escrowsParticipated: participated.length,
          totalVolume,
          pendingEscrows: pending,
          fundedEscrows: funded,
          completedEscrows: completed,
        })

        // Get recent escrows (last 5)
        setRecentEscrows(data.escrows.slice(0, 5))
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [walletAddress])

  useEffect(() => {
    ;(async () => {
      const u = await getCurrentUser()
      setMe(u)
    })()
  }, [])

  const handleResendVerification = async () => {
    try {
      setIsResending(true)
      const res = await resendVerificationEmail()
      toast.success(res.message || 'Verification email sent')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600">Wallet Dashboard</h1>
          <div className="flex items-center gap-4">
            <NotificationsBell />
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">Demo Wallet Connected</span>
            </div>
            <Link
              href="/"
              className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Home
            </Link>
          </div>
        </header>

        {/* Wallet Info Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Wallet Information</h2>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Wallet Address</label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-mono text-gray-900 break-all">{walletAddress}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Network</label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-900">{demoWallet.network}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Balance</label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-primary-600">{demoWallet.balance} ETH</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Total Transactions</label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{stats.escrowsParticipated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email verification banner */}
        {me && me.emailVerified === false && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">Verify your email</h3>
                <p className="text-sm mt-1">
                  Some features may be limited until your email is verified. Check your inbox for the verification link.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="shrink-0 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
              >
                {isResending ? 'Sending…' : 'Resend Email'}
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Escrows Created</p>
                <p className="text-3xl font-bold text-primary-600">
                  {isLoading ? '...' : stats.escrowsCreated}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Escrows Participated</p>
                <p className="text-3xl font-bold text-green-600">
                  {isLoading ? '...' : stats.escrowsParticipated}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Volume</p>
                <p className="text-3xl font-bold text-blue-600">
                  {isLoading ? '...' : `${stats.totalVolume.toFixed(2)} ETH`}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {isLoading ? '...' : stats.pendingEscrows}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Funded</p>
                <p className="text-3xl font-bold text-blue-600">
                  {isLoading ? '...' : stats.fundedEscrows}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {isLoading ? '...' : stats.completedEscrows}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/create"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition text-center"
            >
              Create Escrow
            </Link>
            <Link
              href="/my-escrows"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
            >
              My Escrows
            </Link>
            <Link
              href="/escrows"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
            >
              View All Escrows
            </Link>
          </div>
        </div>

        {/* Recent Escrows */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Recent Escrows</h3>
            <Link
              href="/my-escrows"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              View All
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : recentEscrows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No escrows yet</p>
              <Link
                href="/create"
                className="text-primary-600 hover:text-primary-700 hover:underline"
              >
                Create your first escrow
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEscrows.map((escrow) => (
                <Link
                  key={escrow.id}
                  href={`/escrows/${escrow.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      escrow.status === 'PENDING' ? 'bg-yellow-100' :
                      escrow.status === 'FUNDED' ? 'bg-blue-100' :
                      escrow.status === 'RELEASED' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        escrow.status === 'PENDING' ? 'text-yellow-600' :
                        escrow.status === 'FUNDED' ? 'text-blue-600' :
                        escrow.status === 'RELEASED' ? 'text-green-600' :
                        'text-gray-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{escrow.title || `Escrow #${escrow.id.slice(0, 8)}`}</p>
                      <p className="text-sm text-gray-600">
                        {escrow.amount} {escrow.token} • {escrow.status}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(escrow.createdAt * 1000).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

