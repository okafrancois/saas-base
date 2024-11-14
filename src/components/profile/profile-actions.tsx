'use client'
import cardFront from '../../assets/card-back1.jpg'
import cardBack from '../../assets/card-back2.jpg'
import drapGabon from '../../assets/drapeau-gabon.png'
import { useRouter } from 'next/navigation'
import { deleteProfile } from '@/actions/profile'
import { Share1Icon, TrashIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import * as React from 'react'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { DownloadIcon, MailIcon, NfcIcon, QrCodeIcon } from 'lucide-react'
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
import { FullProfile } from '@/lib/models-types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { QRCodeSVG } from 'qrcode.react'
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
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { generateVCardString } from '@/lib/utils'

export function DeleteProfileButton({ id }: Readonly<{ id: string }>) {
  const router = useRouter()
  const t = useTranslations('profile')

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'} className={'w-max'}>
          <span>{t('actions.delete_profile')}</span>
          <TrashIcon color={'white'} className={'size-6 cursor-pointer'} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('messages.delete_confirm')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('messages.delete_warning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteProfile(id).then(() => {
                router.push(PAGE_ROUTES.base)
              })
            }}
          >
            <span>{t('actions.delete_profile')}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ShareProfile({ profile }: Readonly<{ profile: FullProfile }>) {
  const t = useTranslations('profile')

  return (
    <RWebShare
      data={{
        title: `${t('messages.contact_request', { name: profile.firstName })}`,
        url: `${process.env.NEXT_PUBLIC_URL}${PAGE_ROUTES.profiles}/${profile.id}`,
      }}
    >
      <Button
        className={'w-full gap-2 rounded-full'}
        type={'button'}
        variant={'outline'}
      >
        {<Share1Icon />}
        {t('actions.share_profile')}
      </Button>
    </RWebShare>
  )
}

export function SaveContact({ data }: Readonly<{ data: FullProfile }>) {
  const t = useTranslations('profile')
  const vCardData = generateVCardString(data)

  const getVCardDownloadLink = () => {
    if (vCardData) {
      const blob = new Blob([vCardData], {
        type: 'text/vcard;charset=utf-8',
      })
      return URL.createObjectURL(blob)
    }
    return ''
  }

  const sanitizeFileName = (fileName: string) => {
    return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = getVCardDownloadLink()
    link.download = `${sanitizeFileName(`${data?.firstName || 'contact'}`)}_${sanitizeFileName(`${data?.lastName || 'card'}`)}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      onClick={handleDownload}
      className={'w-full gap-2 rounded-full'}
      type={'button'}
    >
      <DownloadIcon className={'size-5'} />
      {t('actions.save_contact')}
    </Button>
  )
}

export function SendMessage({ profile }: Readonly<{ profile: FullProfile }>) {
  const t = useTranslations('profile')
  const t_common = useTranslations('common')

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className={'w-full gap-2 rounded-full'}
          variant={'default'}
          type={'button'}
        >
          <MailIcon className={'size-5'} />
          {t('actions.send_message')}
        </Button>
      </DrawerTrigger>
      <DrawerContent className={'container mb-6 max-w-max'}>
        <DrawerHeader className={'px-0'}>
          <DrawerTitle>
            {t('messages.contact_request', { name: `${profile.firstName} ${profile.lastName}` })}
          </DrawerTitle>
          <DrawerDescription>
            {t('messages.contact_description', { name: profile.firstName })}
          </DrawerDescription>
        </DrawerHeader>
        <ContactForm
          target={{
            email: `${profile.email}`,
            fullName: `${profile.firstName} ${profile.lastName}`,
          }}
          customButton={
            <DrawerClose asChild>
              <Button className={'w-1/2'} variant="outline">
                {t_common('actions.cancel')}
              </Button>
            </DrawerClose>
          }
        />
      </DrawerContent>
    </Drawer>
  )
}

export function ShowCard({ profile }: Readonly<{ profile: FullProfile }>) {
  const t = useTranslations('profile')
  const t_common = useTranslations('common')
  const shareLink = `${process.env.NEXT_PUBLIC_URL}${PAGE_ROUTES.view}/${profile.id}`

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className={'w-full gap-2 rounded-full'}
          variant={'outline'}
          type={'button'}
        >
          <QrCodeIcon className={'size-5'} />
          {t('actions.show_card')}
        </Button>
      </DrawerTrigger>
      <DrawerContent className={'container space-y-4 pb-4 md:max-w-[500px]'}>
        <BusinessCard profile={profile} link={shareLink} />
        <div className={'flex flex-col items-center gap-2'}>
          <div className="border-2 border-gray-300 bg-white p-2">
            <QRCodeSVG value={shareLink} size={200} />
          </div>
          <p className={'text-sm text-gray-500'}>
            {t('messages.scan_qr', { name: profile.firstName })}
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{t_common('actions.close')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}


type ProfileActionsProps = {
  profile: FullProfile
  link: string
}

function BusinessCard({ profile, link }: Readonly<ProfileActionsProps>) {
  const [showBack, setShowBack] = useState(false)
  const captureRef = useRef(null)
  const printRefBack = useRef(null)
  const t = useTranslations('profile.business_card')

  return (
    <div className={'flex w-full flex-col justify-center gap-4'}>
      {!showBack && (
        <Card
          className={`relative flex aspect-[5/3] size-full max-w-[600px] flex-col justify-between gap-1 overflow-hidden rounded-sm px-5 py-4 lg:max-w-[800px]`}
          onClick={() => setShowBack(true)}
          ref={captureRef}
        >
          <Image
            className={'absolute left-0 top-0 z-0 size-full object-cover'}
            src={cardFront}
            alt={'card-front'}
          />
          <NfcIcon
            className={
              'absolute right-2 top-1/2 size-10 -translate-y-1/2  text-white opacity-60'
            }
            color={'black'}
          />
          <CardHeader className={'p-0'}>
            <h2
              className={
                'text-center text-[1.5em] font-bold uppercase opacity-80'
              }
            >
              {t('consulat_card')}
            </h2>
          </CardHeader>

          <CardContent
            className={
              'content relative z-[1] flex flex-col items-center justify-center gap-2 p-0'
            }
          >
            {profile.consulate && <>
              <Image
                className={
                  'aspect-[3/2] h-auto w-[30%] overflow-hidden rounded-[0.2em] object-cover'
                }
                src={profile.consulate.logo?.url ?? drapGabon}
                alt={'card-front'}
                width={250}
                height={250}
              />

              <p
                className={
                  'flex flex-col text-center text-[1em] font-bold uppercase text-yellow-600 opacity-90'
                }
              >
                <span>{profile.consulate.name}</span>
              </p>
            </>}
          </CardContent>
          <CardFooter className={'z-1 relative p-0'}>
            <p
              className={
                'w-full text-center text-[0.8em] font-normal text-black'
              }
            >
              {profile.consulate && (
                <span>{`${profile.consulate.address.firstLine}, ${profile.consulate.address.zipCode} ${profile.consulate.address.city}`}</span>
              )}
              {profile.consulate && (
                <span>{` - ${t('tel')}: ${profile.consulate.phone}`}</span>
              )}
            </p>
          </CardFooter>
        </Card>
      )}
      {showBack && (
        <Card
          className={`relative flex aspect-[5/3] size-full max-w-[600px] flex-col justify-between overflow-hidden rounded-sm p-4 px-5 lg:max-w-[800px]`}
          onClick={() => setShowBack(false)}
          ref={printRefBack}
        >
          <Image
            className={'absolute left-0 top-0 z-0 size-full object-cover'}
            src={cardBack}
            alt={'card-front'}
          />
          <CardHeader className={'p-0'}>
            <h2
              className={
                'flex flex-col text-center text-[1.5em] font-bold uppercase opacity-80'
              }
            >
              <span> {t('consulat_card')}</span>
              {profile.consulate && (
                <span
                  className={'mt-[-2%] text-[0.7em] capitalize text-blue-500'}
                >
                  {profile.consulate.address.country}
                </span>
              )}
            </h2>
          </CardHeader>

          <CardContent
            className={'content relative z-[1] flex justify-between  gap-4 p-0'}
          >
            <div className="left flex min-h-full flex-col justify-between gap-2">
              <p className={'flex flex-col font-bold'}>
                <span className={'uppercase'}>{profile.firstName}</span>
                <span className={'capitalize'}>{profile.lastName}</span>
              </p>
              <div className="bottom flex flex-col text-[0.8em] font-bold">
                <p>
                  <span className={'text-gray-400'}>{t('issue_date')} </span>
                  <span className={'text-black-500'}>01/01/2021</span>
                </p>
                <p>
                  <span className={'text-gray-400'}>{t('expiry_date')} </span>
                  <span className={'text-black-500'}>30/12/2027</span>
                </p>
              </div>
            </div>
            <div className="right">
              <QRCodeSVG value={link} size={100} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}