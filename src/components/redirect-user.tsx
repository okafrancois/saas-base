'use client'

import { usePathname, useRouter } from 'next/navigation'
import { User, UserRole } from '@prisma/client'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { useLayoutEffect } from 'react'

type Props = {
  user: User
}

export default function RedirectUser({ user }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  useLayoutEffect(() => {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      router.push(PAGE_ROUTES.consulates)
    }

    if (user.role === UserRole.USER) {
      router.push(PAGE_ROUTES.my_profile)
    }

    if (pathname.startsWith(PAGE_ROUTES.admin) && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      router.push(PAGE_ROUTES.my_profile)
    }
  }, [user, router, pathname])

  return null
}