'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  totalEscrows: number
  pendingEscrows: number
  fundedEscrows: number
  completedEscrows: number
  totalUsers: number
  totalVolume: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEscrows: 0,
    pendingEscrows: 0,
    fundedEscrows: 0,
    completedEscrows: 0,
    totalUsers: 0,
    totalVolume: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to load admin stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Back to Home
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Escrows</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalEscrows}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingEscrows}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Funded</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.fundedEscrows}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completedEscrows}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Volume</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.totalVolume.toFixed(2)} ETH</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/admin/disputes"
                className="block bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg hover:bg-yellow-100 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Resolve Disputes</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
              <Link
                href="/escrows"
                className="block bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg hover:bg-blue-100 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">View All Escrows</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email Service</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                  Configured
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}


