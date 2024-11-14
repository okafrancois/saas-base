import * as React from 'react'
import { getTranslations } from 'next-intl/server'

export default async function NotificationLayout({ children }: Readonly<{
  children: React.ReactNode
}>) {
  const t_notifs = await getTranslations('notifications')
  return (<div className="container space-y-6">
    <h2 className="mb-4 text-2xl font-semibold leading-none tracking-tight">
      {t_notifs('title')}
    </h2>
    {children}
  </div>)
}