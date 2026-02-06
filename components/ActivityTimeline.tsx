'use client'

import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: string
  message: string
  createdAt: string | Date
  userId?: string
  metadata?: any
}

interface ActivityTimelineProps {
  activities: Activity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CREATED':
        return '✨'
      case 'FUNDED':
        return '💰'
      case 'RELEASED':
        return '✅'
      case 'REFUNDED':
        return '↩️'
      case 'DISPUTED':
        return '⚠️'
      default:
        return '📝'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'CREATED':
        return 'bg-blue-100 text-blue-800'
      case 'FUNDED':
        return 'bg-green-100 text-green-800'
      case 'RELEASED':
        return 'bg-emerald-100 text-emerald-800'
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800'
      case 'DISPUTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activity yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            {index < activities.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2" />
            )}
          </div>
          <div className="flex-1 pb-8">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-gray-900">{activity.message}</p>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
            </div>
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                {JSON.stringify(activity.metadata, null, 2)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

