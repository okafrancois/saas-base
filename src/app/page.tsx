import * as React from 'react'
import Link from 'next/link'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { buttonVariants } from '@/components/ui/button'
import imagePicture from '@/assets/contact-ga-image.png'
import Image from 'next/image'
import LangSwitcher from '@/components/LangSwitcher'
import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const isAuth = await auth()
  const t = await getTranslations('home')

  return (
    <div
      className={
        'relative flex min-h-screen w-screen flex-col overflow-hidden'
      }
    >
      <header className={'fixed top-4 z-40 w-full md:top-6'}>
        <div className={'container flex w-full items-center justify-between gap-4'}>
          <span className="text-md hidden font-bold uppercase min-[380px]:inline sm:text-base">
            <Link
              href={PAGE_ROUTES.base}
            >
              <span>{t('consulat')}</span>
            </Link>

          </span>
          <div className="flex w-max gap-3">
            <LangSwitcher />
            <Link
              href={PAGE_ROUTES.dashboard}
              className={
                buttonVariants({
                  variant: 'default',
                }) + ' !rounded-full max-[480px]:!px-2'
              }
            >
              {isAuth ? <span>{t('nav.dashboard')}</span> : <span>{t('nav.login')}</span>}

            </Link>
          </div>

        </div>
      </header>
      <div
        className="container relative flex h-full grow flex-col-reverse justify-evenly gap-4 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className='relative max-w-[70%] space-y-4 md:max-w-full'>
          <h2 className={'text-lg font-semibold uppercase lg:text-6xl'}>
            {t('title')}
          </h2>
          <p>{t('subtitle')}</p>
          <div className='actions flex flex-wrap items-center gap-4'>
            <Link
              href={PAGE_ROUTES.consular_registration}
              className={
                buttonVariants({
                  variant: 'default',
                }) +
                ' !rounded-full !text-lg !p-5 leading-none flex flex-col items-center text-center'
              }
            >
              <span className={'leading-none'}>
                {t('cta.request_card')}
              </span>
            </Link>
          </div>
        </div>
        <div className="image-cover w-full md:max-w-[40%]">
          <div className="relative w-full max-w-[400px] overflow-hidden rounded md:max-w-[500px]">
            <iframe
              className={'absolut left-0 top-0 aspect-[1440/1080] size-full max-w-full object-cover'}
              src="https://player.vimeo.com/video/1023725393?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
              width="1440" height="1080" allow="autoplay; picture-in-picture; clipboard-write"
              title="Présentation carte consulaire"></iframe>
          </div>
          <script src="https://player.vimeo.com/api/player.js"></script>
        </div>
        <div className="image absolute -right-16 bottom-0 -z-10 w-full max-w-[50%] md:hidden">
          <Image
            src={imagePicture}
            alt={'business card cover'}
            style={{ objectFit: 'cover' }}
            className={'!h-full !w-full object-cover'}
            width={400}  // Spécifiez une largeur
            height={600} //
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