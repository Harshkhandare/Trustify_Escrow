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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <p className="text-gray-600">Activity feed will be displayed here</p>
        </div>
      </div>
    </main>
  )
}

