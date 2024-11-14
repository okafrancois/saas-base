import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { Route } from 'next'
import Image from 'next/image'
import * as React from 'react'
import { ListingConsulate } from '@/lib/models-types'
import { EditIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

type ProfileItemProps = {
  data: ListingConsulate
}

export async function ConsulateItem({ data }: Readonly<ProfileItemProps>) {
  const t = await getTranslations('consulate')

  return (
    <Card className={'relative aspect-[5/3]'}>
      <CardHeader className={'flex p-4 lg:p-6'}>
        <Image
          src={data.logo?.url ?? '/default-profil-pic.jpg'}
          alt={'Avatar image preview'}
          unoptimized={true}
          className={
            'aspect-square w-[50px] rounded-full object-cover object-center'
          }
          width={100}
          height={100}
        />

        <Link
          className={'absolute right-6 top-4 lg:top-6'}
          href={`${PAGE_ROUTES.consulates}/${data.id}` as Route}
        >
          <span className="sr-only">{t('actions.view', { name: data.name })}</span>
          <EditIcon size={20} className={'cursor-pointer'} />
        </Link>
        <CardTitle
          className={'flex justify-between gap-x-2 text-xl lg:text-2xl'}
        >
          <Link href={`${PAGE_ROUTES.consulates}/${data.id}` as Route}>
            {data.name}
          </Link>
        </CardTitle>
      </CardHeader>
    </Card>
  )
}