'use client'

import { useRouter } from 'next/navigation'
import { Share1Icon, TrashIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import * as React from 'react'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { DownloadIcon, MailIcon, PhoneIcon } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ContactForm } from '@/components/contact-form'
import { FullConsulate } from '@/lib/models-types'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { RWebShare } from 'react-web-share'
import { deleteConsulate } from '@/actions/consulate'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { Icons } from '@/components/ui/icons'

export function DeleteConsulateButton({ id }: Readonly<{ id: string }>) {
  const router = useRouter()
  const t = useTranslations('consulate')
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteConsulate(id)
        router.push(PAGE_ROUTES.consulates)
        router.refresh()
      } catch (error) {
        console.error('Error deleting consulate:', error)
        // Vous pouvez ajouter ici une notification d'erreur pour l'utilisateur
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={isPending} variant={'destructive'} className={'w-max'}>
          <span>{t('actions.delete')}</span>
          {isPending && <Icons.Spinner className="ml-2 size-4 animate-spin" />}
          {!isPending && <TrashIcon color={'white'} className={'size-6 cursor-pointer'} />}

        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('actions.delete_confirm')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('actions.delete_warning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <>
                <Icons.Spinner className="mr-2 size-4 animate-spin" />
                {t('actions.deleting')}
              </>
            ) : (
              t('actions.confirm_delete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ShareCompany({
  company,
}: Readonly<{ company: FullConsulate }>) {
  const t = useTranslations('consulate')

  return (
    <RWebShare
      data={{
        title: t('messages.share_profile'),
        url: `${process.env.NEXT_PUBLIC_URL}${PAGE_ROUTES.view}/${company.id}`,
      }}
    >
      <Button
        className={'w-full gap-2 rounded-full'}
        type={'button'}
        variant={'outline'}
      >
        {<Share1Icon />}
        {t('actions.share')}
      </Button>
    </RWebShare>
  )
}

export function SaveContact({
  vCard,
  name,
}: Readonly<{ vCard: string; name: string }>) {
  const t = useTranslations('consulate')
  const getVCardDownloadLink = () => {
    if (vCard) {
      const blob = new Blob([vCard], {
        type: 'text/vcard',
      })
      return URL.createObjectURL(blob)
    }
    return ''
  }

  return (
    <Button
      onClick={() => {
        const link = document.createElement('a')
        link.href = getVCardDownloadLink()
        link.download = `${name}.vcf`.trim().toLowerCase()
        link.click()
      }}
      className={'w-full gap-2 rounded-full'}
      type={'button'}
    >
      <DownloadIcon className={'size-5'} />
      {t('actions.save')}
    </Button>
  )
}

export function SendMessage({ company }: Readonly<{ company: FullConsulate }>) {
  const t = useTranslations('consulate')

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className={'w-full rounded-full'}
          variant={'outline'}
          type={'button'}
        >
          {t('actions.send_message')}
        </Button>
      </DrawerTrigger>
      <DrawerContent className={'container mb-6 max-w-max'}>
        <DrawerHeader className={'px-0'}>
          <DrawerTitle>{t('messages.contact_request', { name: company.name })}</DrawerTitle>
          <DrawerDescription>
            {t('messages.contact_description', { name: company.name })}
          </DrawerDescription>
        </DrawerHeader>
        <ContactForm
          target={{
            email: `${company.email}`,
            fullName: `${company.name}`,
          }}
          customButton={
            <DrawerClose asChild>
              <Button className={'w-1/2'} variant="outline">
                {t('actions.cancel')}
              </Button>
            </DrawerClose>
          }
        />
      </DrawerContent>
    </Drawer>
  )
}

export function ShowCard({ profile }: Readonly<{ profile: FullConsulate }>) {
  const t = useTranslations('consulate')
  const shareLink = `${process.env.NEXT_PUBLIC_URL}${PAGE_ROUTES.view}/${profile.id}`

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className={'w-full rounded-full'}
          variant={'outline'}
          type={'button'}
        >
          {t('actions.show_card')}
        </Button>
      </DrawerTrigger>
      <DrawerContent className={'container space-y-4 pb-4 md:max-w-[450px]'}>
        <BusinessCard
          profile={profile}
          qrCode={<QRCodeSVG value={shareLink} size={50} />}
        />
        <div className={'flex flex-col items-center gap-2'}>
          <div className="border-2 border-gray-300 bg-white p-2">
            <QRCodeSVG value={shareLink} size={200} />
          </div>
          <p className={'text-sm text-gray-500'}>
            {t('messages.scan_qr', { name: profile.name })}
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{t('actions.cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

type CompanyActionsProps = {
  profile: FullConsulate
  qrCode?: React.ReactNode
}
function BusinessCard({ profile, qrCode }: Readonly<CompanyActionsProps>) {
  return (
    <Card
      className={
        'relative aspect-[5/3] size-full overflow-hidden rounded-sm bg-gray-300 bg-cover bg-center'
      }
    >
      <CardContent
        className={'relative grid h-full grid-cols-2 gap-2 bg-[#ffffff0f] p-3'}
      >
        <div className="left">
          <Image
            src={profile.logo?.url ?? '/default-profile-pic.svg'}
            alt={`${profile.name} Company Picture`}
            width={50}
            height={50}
            className={
              'border-primary-200 mb-2 aspect-square max-w-[100px] rounded-full border-2'
            }
            priority={false}
          />
          <h3 className={'mb-1 font-semibold'}>{profile.name}</h3>
        </div>
        <div className="right flex h-full flex-col gap-2">
          {qrCode && (
            <div className={'flex justify-end'}>
              <div className={'border-2 border-gray-300 bg-white p-1'}>
                {qrCode}
              </div>
            </div>
          )}

          <div className="contact-infos flex grow flex-col items-end justify-end gap-2">
            <Link
              href={`tel:${profile.phone}`}
              className={'flex items-center gap-1'}
            >
              <span className={'text-sm'}>{profile.phone}</span>
              <PhoneIcon
                className={
                  'aspect-square size-5 rounded-full border border-gray-300 p-[3px]'
                }
              />
            </Link>

            <Link
              href={`mailto:${profile.email}`}
              className={'flex items-center gap-1'}
            >
              <span className={'text-sm'}>{profile.email}</span>
              <MailIcon
                className={
                  'aspect-square size-5 rounded-full border border-gray-300 p-[3px]'
                }
              />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}