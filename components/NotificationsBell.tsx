'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { fetchNotifications } from '@/lib/api'

export function NotificationsBell({
  className,
  pollMs = 20000,
}: {
  className?: string
  pollMs?: number
}) {
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const badge = useMemo(() => {
    if (unreadCount <= 0) return null
    return unreadCount > 99 ? '99+' : String(unreadCount)
  }, [unreadCount])

  useEffect(() => {
    let mounted = true
    let timer: any

    const load = async () => {
      try {
        const data = await fetchNotifications({ unreadOnly: true, limit: 100 })
        if (!mounted) return
        setUnreadCount(data.notifications?.length || 0)
      } catch {
        // If user isn't logged in, endpoint may return [] or 401 in some setups.
        if (mounted) setUnreadCount(0)
      }
    }

    load()
    timer = setInterval(load, pollMs)

    return () => {
      mounted = false
      if (timer) clearInterval(timer)
    }
  }, [pollMs])

  return (
    <Link
      href="/notifications"
      className={
        className ||
        'relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-md hover:shadow-lg transition border border-gray-200'
      }
      aria-label="Notifications"
      title="Notifications"
    >
      <svg
        className="w-5 h-5 text-gray-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {badge && (
        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  )
}


