import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { EditIcon } from 'lucide-react'
import { Route } from 'next'
import { ListingProfile } from '@/lib/models-types'
import { useTranslations } from 'next-intl'

type ProfileItemProps = {
  data: ListingProfile
}

export function ProfileItem({ data }: Readonly<ProfileItemProps>) {
  const t = useTranslations('profile')

  return (
    <Card className={'relative aspect-[5/3]'}>
      <CardHeader className={'p-4 lg:p-6'}>
        <CardTitle
          className={'flex justify-between gap-x-2 text-xl lg:text-2xl'}
        >
          <Link href={`${PAGE_ROUTES.profiles}/${data.id}` as Route}>
            {data.firstName} {data.lastName}
            <span className="sr-only">
              {t('actions.view', { name: `${data.firstName} ${data.lastName}` })}
            </span>
          </Link>
          <div className="actions flex h-max items-center gap-x-2">
            <Link href={`${PAGE_ROUTES.profiles}/${data.id}?edit` as Route}>
              <span className="sr-only">
                {t('actions.edit', { name: `${data.firstName} ${data.lastName}` })}
              </span>
              <EditIcon size={20} className={'cursor-pointer'} />
            </Link>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  )
}