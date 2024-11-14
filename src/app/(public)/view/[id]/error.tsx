'use client'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

type ErrorPageProps = {
  error: never
  reset: () => void
}

export default function ErrorPage({ error, reset }: Readonly<ErrorPageProps>) {
  const t = useTranslations('common')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-[420px]">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl lg:text-7xl">
            {t('messages.something_went_wrong')}
          </CardTitle>
          <CardDescription>
            <p>{t('messages.error')}</p>
            <Button onClick={() => reset()}>{t('actions.retry')}</Button>
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={PAGE_ROUTES.base}>{t('actions.back')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}