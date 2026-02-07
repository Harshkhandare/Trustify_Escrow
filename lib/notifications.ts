import { prisma } from './db'
import logger from './logger'

export interface CreateNotificationParams {
  userId: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type.toUpperCase(),
        title: params.title,
        message: params.message,
        link: params.link,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    })

    logger.info(`Notification created for user ${params.userId}: ${params.title}`)
    return notification
  } catch (error) {
    logger.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        prisma.notification.create({
          data: {
            userId,
            type: params.type.toUpperCase(),
            title: params.title,
            message: params.message,
            link: params.link,
            metadata: params.metadata ? JSON.stringify(params.metadata) : null,
          },
        })
      )
    )

    logger.info(`Created ${notifications.length} notifications`)
    return notifications
  } catch (error) {
    logger.error('Error creating notifications:', error)
    throw error
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    })
  } catch (error) {
    logger.error('Error getting unread count:', error)
    return 0
  }
}

