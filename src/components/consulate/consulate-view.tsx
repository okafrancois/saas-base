import { FullConsulate } from '@/lib/models-types'
import Image from 'next/image'
import defaultCover from '../../assets/default-profil-cover.jpg'
import * as React from 'react'
import Link from 'next/link'
import { Route } from 'next'
import { MapPinIcon, MoveUpRightIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  SendMessage,
  ShareCompany,
} from '@/components/consulate/consulate-actions'
import { Separator } from '@/components/ui/separator'
import CtaContact from '@/components/cta-contact'
import { getTranslations } from 'next-intl/server'

type ProfileViewProps = {
  data: FullConsulate
  showActions?: {
    contact?: boolean
    share?: boolean
    message?: boolean
    card?: boolean
  }
}


export default async function ConsulateView({
                                        data,
                                        showActions,
                                      }: Readonly<ProfileViewProps>) {
  const t = await getTranslations('consulate')

  return (
    <div className={'profile-view'}>
      <div className="profile-content grid grid-cols-12 gap-y-4 py-4 md:container lg:gap-8">
        <div
          className="profile-infos col-span-12 flex flex-wrap items-end justify-between gap-4">
          <div className={'flex items-center gap-4'}>
            <Image
              src={data.logo?.url ?? defaultCover}
              alt={`${data.name} Profile Cover`}
              width={500}
              height={500}
              className={
                'aspect-[3/2] h-[80px] w-auto border border-input bg-white object-cover lg:h-[140px]'
              }
              priority={false}
            />
            <div className="profile-details mg:gap-3 flex flex-col gap-1">
              <h2 className="text-lg font-semibold md:text-xl lg:text-4xl">
                {data.name}
              </h2>
              <div className="profile-links flex items-center gap-4">
                <div className="location hidden items-center lg:flex">
                  <MapPinIcon className="mr-2 size-4" />
                  <span className="text-muted-foreground">
                    {data.address.city && `${data.address.city}, `}
                    {data.address.country}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {showActions && (
            <div className="profile-actions grid w-full grid-cols-2 gap-2 lg:flex">
              {showActions.share && <ShareCompany company={data} />}
              <SendMessage company={data} />
            </div>
          )}
        </div>
        <Separator className={'col-span-12'} />
        <Card
          className={`col-span-12 border-none bg-primary text-primary-foreground shadow-none lg:col-span-8`}
        >
          <CardHeader>
            <h3 className={'text-lg md:text-xl'}>{t('sections.about_us')}</h3>
          </CardHeader>
          <CardContent>
            <p>{data.name}</p>
          </CardContent>
        </Card>

        <Card className={'col-span-12 border-none  shadow-none lg:col-span-4'}>
          <CardHeader>
            <h3 className={'text-lg md:text-xl'}>{t('sections.online_presence')}</h3>
          </CardHeader>
          <CardContent className={'flex flex-wrap gap-2'}>
            {data.website && (
              <Link
                href={data.website as Route}
                target={'_blank'}
                className={
                  'flex h-max items-center gap-2 rounded-md bg-emerald-100 px-6 py-3'
                }
              >
                <span className={'flex items-center gap-2'}>
                  {t('actions.visit_website')}
                </span>
                <MoveUpRightIcon className={'size-4'} />
              </Link>
            )}
          </CardContent>
        </Card>
        <CtaContact />
      </div>
    </div>
  )
}