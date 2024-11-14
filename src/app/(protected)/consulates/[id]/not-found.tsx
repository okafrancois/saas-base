import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('consulate')
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-[420px]">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl lg:text-7xl">404</CardTitle>
          <CardDescription>{t('messages.not_found')}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={PAGE_ROUTES.consulates}>
              {t('actions.back')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}