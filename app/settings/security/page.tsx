'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SecuritySettingsPage() {
  const [status, setStatus] = useState<{ enabled: boolean; backupCodesRemaining: number } | null>(null)
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string; issuer: string } | null>(null)
  const [code, setCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [disableBackup, setDisableBackup] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStatus = async () => {
    try {
      const res = await fetch('/api/auth/2fa/status', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load status')
      setStatus(data)
    } catch (e) {
      setStatus(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  const startSetup = async () => {
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start setup')
      setSetup(data)
      toast.success('2FA setup created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start 2FA setup')
    }
  }

  const enable = async () => {
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to enable 2FA')
      setBackupCodes(data.backupCodes || [])
      setSetup(null)
      setCode('')
      toast.success('2FA enabled')
      await loadStatus()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to enable 2FA')
    }
  }

  const disable = async () => {
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: disablePassword,
          code: disableCode || undefined,
          backupCode: disableBackup || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to disable 2FA')
      toast.success('2FA disabled')
      setDisablePassword('')
      setDisableCode('')
      setDisableBackup('')
      setBackupCodes(null)
      await loadStatus()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to disable 2FA')
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Security</h1>
          <Link
            href="/dashboard"
            className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition border border-gray-200"
          >
            Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-2">Two-factor authentication (2FA)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add an extra layer of security using an authenticator app.
          </p>

          {isLoading ? (
            <p className="text-gray-600">Loading…</p>
          ) : !status ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg p-4">
              <p className="font-semibold">Login required</p>
              <p className="text-sm mt-1">Please login to manage your security settings.</p>
              <div className="mt-3">
                <Link href="/login" className="text-primary-600 hover:underline font-semibold">
                  Go to Login
                </Link>
              </div>
            </div>
          ) : status.enabled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-green-700">Enabled</span>
                <span className="text-sm text-gray-600">
                  Backup codes remaining: {status.backupCodesRemaining}
                </span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-2">Disable 2FA</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="Your password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">2FA Code</label>
                    <input
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Backup Code</label>
                    <input
                      value={disableBackup}
                      onChange={(e) => setDisableBackup(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-mono"
                      placeholder="ABCDE12345"
                    />
                  </div>
                </div>
                <button
                  onClick={disable}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Disable 2FA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {!setup ? (
                <button
                  onClick={startSetup}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Start 2FA Setup
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="font-semibold mb-2">Step 1: Add to authenticator app</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Scan the QR using your authenticator app or manually enter the secret.
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Secret:</span>{' '}
                      <span className="font-mono break-all">{setup.secret}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2 break-all">
                      {setup.otpauthUrl}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Step 2: Confirm</p>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter a 6-digit code
                    </label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="123456"
                    />
                    <button
                      onClick={enable}
                      className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>
              )}

              {backupCodes && backupCodes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-bold mb-2">Backup Codes (save these now)</p>
                  <p className="text-sm text-gray-700 mb-3">
                    You will not be able to see these again.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((c) => (
                      <code key={c} className="bg-white border border-yellow-200 rounded px-2 py-1 font-mono text-sm">
                        {c}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}


