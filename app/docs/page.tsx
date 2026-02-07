'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DocsPage() {
  const [spec, setSpec] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/openapi')
        const data = await res.json()
        setSpec(data)
      } catch {
        setError('Failed to load OpenAPI spec')
      }
    })()
  }, [])

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">API Docs</h1>
            <p className="text-gray-600 mt-1">
              OpenAPI JSON available at <code className="px-2 py-1 bg-gray-100 rounded">/api/openapi</code>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition border border-gray-200"
            >
              Home
            </Link>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : !spec ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
            <p className="mt-3 text-gray-600">Loading…</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-3">OpenAPI Spec (JSON)</h2>
            <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto">
              {JSON.stringify(spec, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  )
}


