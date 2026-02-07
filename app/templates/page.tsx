'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { EscrowTemplate } from '@/types/template'
import { createTemplate, deleteTemplate, fetchTemplates, getCurrentUser } from '@/lib/api'

function parseJsonOrNull(input: string): Record<string, any> | undefined {
  const trimmed = input.trim()
  if (!trimmed) return undefined
  const parsed = JSON.parse(trimmed)
  if (!parsed || typeof parsed !== 'object') throw new Error('defaultData must be a JSON object')
  return parsed
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EscrowTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [me, setMe] = useState<any>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('one-time')
  const [isPublic, setIsPublic] = useState(true)
  const [defaultData, setDefaultData] = useState('{\n  \"feePercentage\": 1,\n  \"feePaidBy\": \"payer\",\n  \"releaseCondition\": \"manual\",\n  \"disputeWindow\": 3\n}')
  const [isCreating, setIsCreating] = useState(false)

  const refresh = async () => {
    try {
      setIsLoading(true)
      const [t, u] = await Promise.all([fetchTemplates(), getCurrentUser()])
      setTemplates(t.templates || [])
      setMe(u)
    } catch (e) {
      toast.error('Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const myTemplateIds = useMemo(() => {
    if (!me?.id) return new Set<string>()
    return new Set(templates.filter((t) => t.createdBy === me.id).map((t) => t.id))
  }, [me, templates])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Template name is required')
      return
    }

    setIsCreating(true)
    try {
      const dd = parseJsonOrNull(defaultData)
      await createTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        isPublic,
        defaultData: { type, ...(dd || {}) },
      })
      toast.success('Template created')
      setName('')
      setDescription('')
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create template')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return
    try {
      await deleteTemplate(id)
      toast.success('Template deleted')
      await refresh()
    } catch (e) {
      toast.error('Failed to delete template')
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Escrow Templates</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/create"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Create Escrow
            </Link>
            <Link
              href="/"
              className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition border border-gray-200"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Create */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Create Template</h2>
            <p className="text-sm text-gray-600 mb-4">
              Save a reusable starting point for common escrow setups.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white border-gray-300"
                  placeholder="e.g., Milestone Project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white border-gray-300"
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white border-gray-300"
                  >
                    <option value="one-time">One-time</option>
                    <option value="milestone">Milestone</option>
                    <option value="time-locked">Time-locked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                  <select
                    value={isPublic ? 'public' : 'private'}
                    onChange={(e) => setIsPublic(e.target.value === 'public')}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white border-gray-300"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Data (JSON)
                </label>
                <textarea
                  value={defaultData}
                  onChange={(e) => setDefaultData(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white border-gray-300 font-mono text-xs min-h-40"
                  spellCheck={false}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This JSON is merged into the Create Escrow wizard when you apply the template.
                </p>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
              >
                {isCreating ? 'Creating…' : 'Create Template'}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-1">Browse Templates</h2>
              <p className="text-sm text-gray-600">
                Click “Use” to start an escrow prefilled from a template.
              </p>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-lg shadow-md p-10 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
                <p className="mt-3 text-gray-600">Loading templates…</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-10 text-center">
                <p className="text-gray-600">No templates yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {templates.map((t) => (
                  <div key={t.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{t.name}</h3>
                        <p className="text-sm text-gray-600">
                          {t.description || 'No description'}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-800">
                        {t.type}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Link
                        href={`/create?templateId=${t.id}`}
                        className="flex-1 text-center bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
                      >
                        Use
                      </Link>

                      {myTemplateIds.has(t.id) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          className="px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-semibold transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                      <span>{t.isPublic ? 'Public' : 'Private'}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}


