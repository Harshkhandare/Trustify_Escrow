import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ notifications: [] })
    }

    // Get unread notifications for the user
    // This is a simplified version - you'd want a proper notifications table
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        message: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      notifications: activities.map((n) => ({
        id: n.id,
        type: n.type.toLowerCase() as 'info' | 'success' | 'warning' | 'error',
        message: n.message,
        timestamp: n.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ notifications: [] })
  }
}

