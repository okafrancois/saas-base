'use client'

import { useEffect } from 'react'
import { Attachment, Notification, UserRole } from '@prisma/client'
import { markNotificationAsViewed } from '@/actions/notifications'
import { useInView } from 'react-intersection-observer'
import ReactMarkdown from 'react-markdown'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useTranslations } from 'next-intl'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { buttonVariants } from '@/components/ui/button'
import { ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { RoleGuard } from '@/components/role-guard'

export type ExtendedNotification = Notification & {
  attachments: Attachment[]
}

type NotificationListProps = {
  notifications: ExtendedNotification[],
}

export function NotificationList({ notifications }: NotificationListProps) {
  const t_notifs = useTranslations('notifications')
  return (
    <div className={'flex flex-col gap-4'}>
      <RoleGuard roles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER]}>
        <Link
          href={PAGE_ROUTES.notifications_create}
          className={
            buttonVariants({ variant: 'default' }) +
            ' !text-primary-foreground self-end hover:!text-secondary-foreground md:w-max'
          }
        >
          {t_notifs('form.new_title')}
          <ArrowUpRightIcon className="size-4" />
        </Link>
      </RoleGuard>
      <div className="space-y-4">
        {!notifications.length && <h3>{t_notifs('messages.no_notification')}</h3>}
        {notifications.map(notification => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  )
}

function NotificationItem({ notification }: {
  notification: ExtendedNotification,
}) {
  const currentUserId = useCurrentUser()?.id
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  })

  useEffect(() => {
    if (inView && !notification.viewedBy.includes(currentUserId ?? '')) {
      markNotificationAsViewed(notification.id)
    }
  }, [inView, notification, currentUserId])

  const isUnread = !notification.viewedBy.includes(currentUserId ?? '')

  return (
    <div ref={ref} className={`rounded border p-4 ${isUnread ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}>
      <h3 className="text-lg font-semibold">{notification.title}</h3>
      <div className="prose prose-sm mt-2">
        <ReactMarkdown>{notification.content}</ReactMarkdown>
      </div>
      {notification.attachments && notification.attachments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold">Pièces jointes:</h4>
          <ul className="list-disc pl-5">
            {notification.attachments.map(attachment => (
              <li key={attachment.id}>
                <a href={attachment.url} target="_blank" rel="noopener noreferrer"
                   className="text-blue-500 hover:underline">
                  {attachment.filename}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-2 text-sm text-gray-500">
        {new Date(notification.createdAt).toLocaleString()}
      </div>
    </div>
  )
}