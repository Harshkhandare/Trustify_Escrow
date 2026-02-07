'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { Notification } from '@/types/notification'
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api'

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function typeColor(type: string) {
  const t = type.toLowerCase()
  if (t.includes('error')) return 'bg-red-100 text-red-800'
  if (t.includes('warn')) return 'bg-yellow-100 text-yellow-800'
  if (t.includes('success')) return 'bg-green-100 text-green-800'
  return 'bg-blue-100 text-blue-800'
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items])

  const load = async () => {
    try {
      setIsLoading(true)
      const data = await fetchNotifications({
        unreadOnly: showUnreadOnly,
        limit: 100,
      })
      setItems(data.notifications || [])
    } catch (e) {
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [showUnreadOnly])

  // Poll for updates
  useEffect(() => {
    let mounted = true
    const timer = setInterval(async () => {
      try {
        const data = await fetchNotifications({
          unreadOnly: showUnreadOnly,
          limit: 100,
        })
        if (!mounted) return
        setItems(data.notifications || [])
      } catch {
        // ignore
      }
    }, 15000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [showUnreadOnly])

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      toast.success('All notifications marked as read')
      await load()
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      setItems((prev) => prev.filter((n) => n.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount} unread
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition border border-gray-200"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition border border-gray-200"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
            />
            Show unread only
          </label>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
            <p className="mt-3 text-gray-600">Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <p className="text-gray-600">No notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-lg shadow-md p-5 border ${
                  n.read ? 'border-gray-100' : 'border-primary-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${typeColor(n.type)}`}>
                        {n.type}
                      </span>
                      {!n.read && (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-primary-100 text-primary-700">
                          UNREAD
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 truncate">{n.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatTime(n.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {n.link && (
                      <Link
                        href={n.link}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 font-semibold text-sm"
                      >
                        Open
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-semibold text-sm"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}


