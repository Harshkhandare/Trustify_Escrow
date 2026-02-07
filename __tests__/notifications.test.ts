import { createNotification, getUnreadCount } from '../lib/notifications'
import { prisma } from '../lib/db'

// Mock Prisma
jest.mock('../lib/db', () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}))

describe('Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const mockNotification = {
        id: '1',
        userId: 'user1',
        type: 'INFO',
        title: 'Test',
        message: 'Test message',
        read: false,
        createdAt: new Date(),
      }

      ;(prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification)

      const result = await createNotification({
        userId: 'user1',
        type: 'info',
        title: 'Test',
        message: 'Test message',
      })

      expect(result).toEqual(mockNotification)
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          type: 'INFO',
          title: 'Test',
          message: 'Test message',
          link: undefined,
          metadata: null,
        },
      })
    })
  })

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      ;(prisma.notification.count as jest.Mock).mockResolvedValue(5)

      const count = await getUnreadCount('user1')

      expect(count).toBe(5)
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          read: false,
        },
      })
    })
  })
})

