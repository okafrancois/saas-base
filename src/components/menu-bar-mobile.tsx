'use client'

import { useCurrentUser, useUserCountry } from '@/hooks/use-current-user'
import {
  Menubar,
  MenubarMenu,
} from '@/components/ui/menubar'
import { useTranslations } from 'next-intl'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { BellRingIcon, Building, UserRoundIcon } from 'lucide-react'
import { UserRole } from '@prisma/client'
import { MenuItem } from '@/components/app-sidebar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MenuBarMobile() {
  const path = usePathname()
  const user = useCurrentUser()
  const t_nav = useTranslations('navigation')
  const userCountry = useUserCountry()


  function getCurrentUserMenu(): MenuItem[] {
    if (user?.role) {
      return menus[user.role]
    }
    return []
  }

  const mainUserMenu: MenuItem[] = [{
    title: t_nav('my_profile'),
    url: PAGE_ROUTES.my_profile,
    icon: UserRoundIcon,
    isActive: true,
    items: [
      {
        title: 'Informations de base',
        url: '#base',
      },
      {
        title: 'Mes documents',
        url: '#documents',
      },
    ],
  }, {
    title: t_nav('notifications'),
    url: PAGE_ROUTES.notifications,
    icon: BellRingIcon,
    isActive: true,
  }]

  const mainAdminMenu: MenuItem[] = [{
    title: t_nav('my_profile'),
    url: PAGE_ROUTES.my_profile,
    icon: UserRoundIcon,
    isActive: true,
    items: [
      {
        title: 'Informations de base',
        url: '#base',
      },
      {
        title: 'Mes documents',
        url: '#documents',
      },
    ],
  }, {
    title: t_nav('consulates'),
    url: PAGE_ROUTES.consulates,
    icon: Building,
    isActive: true,
  },
    {
      title: t_nav('notifications'),
      url: PAGE_ROUTES.notifications,
      icon: BellRingIcon,
      isActive: true,
    },
  ]

  const menus = {
    [UserRole.USER]: mainUserMenu,
    [UserRole.SUPER_ADMIN]: mainAdminMenu,
    [UserRole.ADMIN]: mainAdminMenu,
    [UserRole.MANAGER]: mainAdminMenu,
    [UserRole.SECRET]: mainAdminMenu,
  }

  return (
    <Menubar className={'fixed inset-x-4 bottom-6 flex min-h-[50px] justify-evenly rounded-full p-2 md:hidden'}>
      {getCurrentUserMenu().slice(0, 2).map(menu => (
        <MenubarMenu key={menu.title + menu.url}>
          <Link href={menu.url}
                className={`text-sm uppercase text-gray-500 hover:text-gray-900 ${path.startsWith(menu.url) ? '!text-primary' : ''}`}>
            {menu.title}
          </Link>
        </MenubarMenu>
      ))}
      <MenubarMenu>
        <SidebarTrigger />
      </MenubarMenu>
    </Menubar>
  )
}