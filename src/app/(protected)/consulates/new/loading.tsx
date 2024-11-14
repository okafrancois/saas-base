import { Icons } from '@/components/ui/icons'
import * as React from 'react'
import FormSkeleton from '@/components/ui/form-skeleton'
import { getTranslations } from 'next-intl/server'

export default async function Loading() {
  const t = await getTranslations('consulate')

  return (
    <div className="container space-y-6">
      <h2 className={'flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight'}>
        {t('new.title')} <Icons.Spinner className="size-6 animate-spin" />
      </h2>
      <FormSkeleton/>
    </div>
  )
}