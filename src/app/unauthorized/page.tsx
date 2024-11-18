import React from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { ArrowLeft } from 'lucide-react'

const UnauthorizedPage = () => {
  return (
    <div className={"flex flex-col h-dvh items-center justify-center gap-4"}>
      <h1>
        Accès refusé
      </h1>
      <p>
        {'Vous n\'êtes pas autorisé à accéder à cette page.'}
      </p>
      <Link
        className={
          buttonVariants({
            variant: 'default',
          }) + 'px-0 gap-2 flex items-center !justify-start w-max'
        }
        href={PAGE_ROUTES.base}
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        <span>
          {'Retour à l\'accueil'}
        </span>
      </Link>
    </div>
  )
}

export default UnauthorizedPage