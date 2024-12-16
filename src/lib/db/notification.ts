import { prisma } from '@/lib/prisma'
import type { NotificationData } from '@/types'

export async function createNotification(data: NotificationData) {
  return prisma.notification.create({
    data: {
      title: data.title,
      content: data.content,
      user: { connect: { id: data.userId } }
    }
  })
}

export async function markNotificationAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true }
  })
}

export async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}