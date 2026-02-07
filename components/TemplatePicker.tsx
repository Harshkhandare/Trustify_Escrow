'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchTemplates } from '@/lib/api'
import type { EscrowTemplate } from '@/types/template'
import type { EscrowFormData } from '@/types/escrowForm'
import toast from 'react-hot-toast'
import { applyTemplateDefaults, safeJsonParse } from '@/lib/templateDefaults'

export function TemplatePicker({
  currentFormData,
  onApply,
  className,
}: {
  currentFormData: EscrowFormData
  onApply: (updates: Partial<EscrowFormData>, meta?: { template?: EscrowTemplate }) => void
  className?: string
}) {
  const [templates, setTemplates] = useState<EscrowTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>('')

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) || null,
    [templates, selectedId]
  )

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setIsLoading(true)
        const data = await fetchTemplates()
        if (!mounted) return
        setTemplates(data.templates || [])
      } catch (e) {
        toast.error('Failed to load templates')
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const handleApply = () => {
    if (!selected) return
    const defaults = safeJsonParse(selected.defaultData)
    if (!defaults || typeof defaults !== 'object') {
      toast.error('Template has invalid default data')
      return
    }

    const updates = applyTemplateDefaults(currentFormData, defaults)
    onApply(updates, { template: selected })
    toast.success(`Applied template: ${selected.name}`)
  }

  return (
    <div className={className}>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template (optional)
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-900 bg-white border-gray-300"
            disabled={isLoading}
          >
            <option value="">
              {isLoading ? 'Loading templates…' : 'Select a template…'}
            </option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {selected?.description ? (
            <p className="mt-1 text-sm text-gray-500">{selected.description}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Pick a template to prefill common settings (fees, release condition, dispute window, etc.)
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleApply}
          disabled={!selected}
          className="px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    </div>
  )
}


