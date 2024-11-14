import ConsulateList from '@/components/consulate/consulate-list'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { Separator } from '@/components/ui/separator'
import * as React from 'react'
import { getTranslations } from 'next-intl/server'

export default async function UserCollectionsListingPage() {
  const t = await getTranslations('consulate')

  return (
    <div className="container space-y-6">
      <h2 className="mb-4 text-2xl font-semibold leading-none tracking-tight">
        {t('title')}
      </h2>
      <Card>
        <CardHeader>
          <Link
            className={
              buttonVariants({
                variant: 'default',
              }) + ' w-full md:w-max'
            }
            href={PAGE_ROUTES.new_company}
          >
            {t('actions.add')}
          </Link>
        </CardHeader>
        <CardContent>
          <Separator className={'mb-4'} />
          <ConsulateList />
        </CardContent>
      </Card>
    </div>
  )
}