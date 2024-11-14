import { NotificationList } from '@/components/notifications/NotificationList'
import { getNotificationsForUser } from '@/actions/notifications'
import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default async function NotificationsPage() {
  const notifications = await getNotificationsForUser()
  return (<Card className={'pt-6'}>
    <CardContent>
      <NotificationList notifications={notifications} />
    </CardContent>
  </Card>)
}