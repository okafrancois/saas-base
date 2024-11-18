import { db } from '@/lib/prisma'
import type { NotificationData } from '@/types'

export async function createNotification(data: NotificationData) {
  return db.notification.create({
    data: {
      title: data.title,
      content: data.content,
      user: { connect: { id: data.userId } }
    }
  })
}

export async function markNotificationAsRead(id: string) {
  return db.notification.update({
    where: { id },
    data: { read: true }
  })
}

export async function getUnreadNotifications(userId: string) {
  return db.notification.findMany({
    where: {
      userId,
      read: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}