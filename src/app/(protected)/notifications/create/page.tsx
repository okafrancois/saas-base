import { NotificationForm } from '@/components/admin/NotificationForm'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import * as React from 'react'
import { getTranslations } from 'next-intl/server'
import { getConsulates } from '@/actions/consulate'

export default async function CreateNotificationPage() {
  const t_notifs = await getTranslations('notifications')
  const consulates = await getConsulates()
  return (<Card>
    <CardHeader className={'flex justify-between gap-2'}>
      <h3 className="mb-4 text-xl font-semibold leading-none tracking-tight">
        {t_notifs('form.new_title')}
      </h3>
    </CardHeader>
    <CardContent>
      <NotificationForm consulates={consulates} />
    </CardContent>
  </Card>)
}