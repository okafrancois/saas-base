import { LogoutButton } from '@/components/logout-button'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import * as React from 'react'
import { Building2Icon, UserIcon } from 'lucide-react'
import { MobileMenu, NavMenu } from '@/components/navigation'
import { Route } from 'next'
import DarkModeToggle from '@/components/ui/darkmode-toggle'
import { UserRole } from '@prisma/client'
import LangSwitcher from '@/components/LangSwitcher'
import { getTranslations } from 'next-intl/server'
import { getUnreadNotificationCount } from '@/actions/notifications'
import { getCurrentUser } from '@/actions/user'

export type MenuItem = {
  icon: React.ReactNode
  label: string
  href: Route<string>
  roles?: UserRole[]
}

export default async function SideBar() {
  const currentUser = await getCurrentUser()
  const unreadCount = await getUnreadNotificationCount(currentUser?.id ?? '')

  const t = await getTranslations('home')
  const tNav = await getTranslations('navigation')

  const menuItems: MenuItem[] = [
    {
      icon: <UserIcon className={'size-6'} />,
      label: tNav('my_space'),
      href: PAGE_ROUTES.my_profile,
      roles: [
        UserRole.USER,
        UserRole.SUPER_ADMIN,
        UserRole.MANAGER,
        UserRole.ADMIN,
      ],
    },
    {
      icon: <Building2Icon className={'size-6'} />,
      label: tNav('consulates'),
      href: PAGE_ROUTES.consulates,
      roles: [UserRole.SUPER_ADMIN],
    },
  ]

  return (
    <aside>
      <div className="fixed left-4 top-4 min-w-max md:hidden">
        <span className="text-md hidden font-bold uppercase min-[380px]:inline">
            {t('consulat')}
          </span>
      </div>
      <div className="desktop hidden h-screen w-[250px] flex-col space-y-6 px-4 py-6 md:flex">
        <span className="text-md mx-4 hidden font-bold uppercase min-[380px]:inline">
            {t('consulat')}
          </span>
        <div className="content flex-1">
          <NavMenu links={menuItems} unreadCount={unreadCount} />
        </div>
        <div className="sidebar-footer flex flex-col space-y-2">
          <span className={'px-3'}>
            <LangSwitcher />
          </span>
          <span className={'px-3'}>
            <DarkModeToggle />
          </span>
          <LogoutButton customClass={'!justify-start'} />
        </div>
      </div>
      <div className="mobile fixed bottom-6 right-4 z-10 flex md:hidden">
        <MobileMenu links={menuItems} unreadCount={unreadCount} />
      </div>
    </aside>
  )
}