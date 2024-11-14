'use server'

import { db } from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user'
import { Attachment, Notification, NotificationType, UserRole } from '@prisma/client'

export type ExtendedNotification = Notification & {
  attachments: Attachment[]
}

export type CreateNotificationInput = {
  title: string
  content: string
  type: NotificationType
  recipientIds?: string[]
  consulateId?: string
  attachments?: { url: string; filename: string; mimeType: string }[]
}

export async function canSendNotifications(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER || user?.role === UserRole.SUPER_ADMIN
}

export async function createNotification(data: CreateNotificationInput): Promise<Notification> {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error('Unauthorized')

  const canSend = await canSendNotifications()
  if (!canSend) throw new Error('Insufficient permissions')

  let recipients: string[] = []
  if (data.type === NotificationType.INDIVIDUAL) {
    recipients = data.recipientIds ?? []
  } else if (data.type === NotificationType.CONSULATE) {
    const consulateUsers = await db.user.findMany({
      where: { profile: { consulate: { id: data.consulateId } } },
    })
    recipients = consulateUsers.map(user => user.id)
  }

  return db.notification.create({
    data: {
      title: data.title,
      content: data.content,
      type: data.type,
      sender: { connect: { id: currentUser.id } },
      recipients: { connect: recipients.map(id => ({ id })) },
      consulate: data.consulateId ? { connect: { id: data.consulateId } } : undefined,
      attachments: {
        create: data.attachments,
      },
      viewedBy: [],
    },
    include: {
      attachments: true,
      recipients: true,
    },
  })
}

export async function markNotificationAsViewed(notificationId: string): Promise<void> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    throw Error('User not founded')
  }

  await db.notification.update({
    where: { id: notificationId },
    data: {
      viewedBy: {
        push: currentUser.id,
      },
    },
  })
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const notifications = await db.notification.findMany({
    where: {
      recipients: { some: { id: userId } },
    },
  })
  return notifications.filter(item => !item.viewedBy.includes(userId)).length
}

export async function markAllNotificationsAsViewed(userId: string): Promise<void> {
  const notifications = await getNotificationsForUser()

  await Promise.all(notifications.map(notification =>
    db.notification.update({
      where: { id: notification.id },
      data: {
        viewedBy: {
          push: userId,
        },
      },
    }),
  ))
}

export async function getNotificationsForUser(): Promise<ExtendedNotification[]> {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error('Unauthorized')

  let notifications: ExtendedNotification[]

  switch (currentUser.role) {
    case UserRole.ADMIN:
      // Les admins voient toutes les notifications
      notifications = await db.notification.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          attachments: true,
        },
      })
      break
    case UserRole.MANAGER:
      // Les managers voient les notifications de leurs consulats et les leurs
      const managedConsulates = await db.consulate.findMany({
        where: { userId: currentUser.id },
        select: { id: true },
      })
      notifications = await db.notification.findMany({
        where: {
          OR: [
            { recipients: { some: { id: currentUser.id } } },
            { consulate: { id: { in: managedConsulates.map(c => c.id) } } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          attachments: true,
        },
      })
      break
    default:
      // Les utilisateurs normaux ne voient que leurs propres notifications
      notifications = await db.notification.findMany({
        where: {
          recipients: { some: { id: currentUser.id } },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          attachments: true,
        },
      })
      break
  }

  return notifications
}