import * as React from 'react'
import Link from 'next/link'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { Button, buttonVariants } from '@/components/ui/button'
import imagePicture from '@/assets/contact-ga-image.png'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { DialogBody } from 'next/dist/client/components/react-dev-overlay/internal/components/Dialog'
import DarkModeToggle from '@/components/ui/darkmode-toggle'
import { useTranslations } from 'next-intl'
import LangSwitcher from '@/components/LangSwitcher'

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <div
      className={
        'relative flex min-h-screen w-screen flex-col overflow-hidden'
      }
    >
      <header className={'fixed top-4 z-40 w-full md:top-6'}>
        <div className={'container flex items-start justify-between gap-4'}>
          <div className="logo flex w-max flex-col gap-2 sm:w-full sm:flex-row sm:items-center sm:gap-x-6">
            <div className='image flex items-center'>
              <span className="hidden text-xs font-bold uppercase min-[380px]:inline sm:text-base">
                {t('consulat')}
              </span>
            </div>
            <DarkModeToggle />
            <LangSwitcher />
          </div>
          <Link
            href={PAGE_ROUTES.login}
            className={
              buttonVariants({
                variant: 'default',
              }) + ' !rounded-full max-[480px]:!px-2'
            }
          >
            <span>{t('nav.login')}</span>
          </Link>
        </div>
      </header>
      <div
        className="container relative flex h-full grow flex-col-reverse justify-evenly gap-4 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className='relative max-w-[55%] space-y-4'>
          <h2 className={'text-lg font-semibold uppercase lg:text-6xl'}>
            {t('title')}
          </h2>
          <p className={'max-w-[500px]'}>{t('subtitle')}</p>
          <div className='actions flex flex-wrap items-center gap-4'>
            <Link
              href={PAGE_ROUTES.consular_registration}
              className={
                buttonVariants({
                  variant: 'default',
                }) +
                ' !rounded-full leading-none flex flex-col items-center  px-6 !py-7 text-center'
              }
            >
              <span className={'text-xl leading-none'}>
                {t('cta.request_card')}
              </span>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline' className={'rounded-full'}>
                  {t('cta.learn_more')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[360px] rounded-md p-0 lg:container">
                <DialogBody>
                  <iframe
                    className={'aspect-[1497/776] h-auto w-full rounded-md'}
                    width='1497'
                    height='776'
                    src='https://www.youtube.com/embed/v5snnfUFZw0'
                    title='NFC-vCard: the modern digital alternative to the classic business card'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                    referrerPolicy='strict-origin-when-cross-origin'
                    allowFullScreen
                  ></iframe>
                </DialogBody>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="image-cover flex items-end justify-center lg:items-center">
          <div className="image relative  aspect-square w-[270px] lg:w-[400px]">
            <Link
              href={PAGE_ROUTES.listing}
              className={
                'loop -translate-y-1/6 absolute right-0 top-0 flex aspect-square min-w-[130px] translate-x-1/4 rotate-[-30deg] items-center justify-center rounded-full border-8 border-[#D19D01] bg-white dark:text-background lg:min-w-[200px]'
              }
            >
              <div
                className={
                  'flex rotate-[30deg] flex-col gap-0 p-1 text-center text-sm uppercase lg:text-xl'
                }
              ></div>
              <span
                className={
                  'absolute bottom-0  h-[70px] w-[20px] translate-y-[99%] rounded-b-md bg-[#D19D01]'
                }
              />
            </Link>
          </div>
        </div>
        <div className="image absolute -right-16 bottom-0 -z-10 w-[70%] lg:hidden">
          <Image
            src={imagePicture}
            alt={'business card cover'}
            layout={'responsive'}
            className={'!h-full !w-full object-cover'}
          />
        </div>
      </div>
      <footer className="bg-muted px-4 py-3 sm:bg-transparent md:py-4">
        <div className='container flex items-center justify-center gap-4'>
          <p className='text-balance text-center text-sm leading-loose text-muted-foreground'>
            {t('footer.designed_by')}{' '}
            <Link
              href='https://presteo.com'
              target='_blank'
              rel='noreferrer'
              className='font-medium underline underline-offset-4'
            >
              Presteo
            </Link>
            .
          </p>
        </div>
      </footer>
    </div>
  )
}