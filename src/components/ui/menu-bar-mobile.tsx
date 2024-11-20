'use client'

import { useCurrentUser } from '@/hooks/use-current-user'
import {
  Menubar,
  MenubarMenu,
} from '@/components/ui/menubar'
import { useTranslations } from 'next-intl'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import {
  FileText,
  Folder,
  Home,
  LayoutDashboard,
  Settings,
  User,
  Users,
} from 'lucide-react'
import { UserRole } from '@prisma/client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavItem } from '@/components/layouts/types'

export function MenuBarMobile() {
  const path = usePathname()
  const user = useCurrentUser()
  const t_user = useTranslations('user')
  const t_admin= useTranslations('admin')

  const userMenu: NavItem[] = [
    {
      title: t_user('nav.dashboard'),
      href: PAGE_ROUTES.dashboard,
      icon: <Home />,
    },
    {
      title: t_user('nav.requests'),
      href: PAGE_ROUTES.requests,
      icon: <FileText/>,
    },
    {
      title: t_user('nav.profile'),
      href: PAGE_ROUTES.profile,
      icon: <User />,
    },
    {
      title: t_user('nav.documents'),
      href: PAGE_ROUTES.documents,
      icon: <Folder/>,
    }
  ]

  const adminMenu: NavItem[] = [
    {
      title: t_admin('nav.dashboard'),
      href: PAGE_ROUTES.admin_dashboard,
      icon: <LayoutDashboard/>,
    },
    {
      title: t_admin('nav.users'),
      href: PAGE_ROUTES.admin_users,
      icon: <Users/>,
    },
    {
      title: t_admin('nav.requests'),
      href: PAGE_ROUTES.admin_requests,
      icon: <FileText/>,
    },
    {
      title: t_admin('nav.settings'),
      href: PAGE_ROUTES.admin_settings,
      icon: <Settings/>,
    }
  ]


  function getCurrentUserMenu(): NavItem[] {
    if (user?.role) {
      return menus[user.role]
    }
    return []
  }

  const menus = {
    [UserRole.USER]: userMenu,
    [UserRole.RESPONSIBLE]: adminMenu,
    [UserRole.SUPER_ADMIN]: adminMenu,
    [UserRole.ADMIN]: adminMenu,
  }

  return (
    <Menubar className={'fixed inset-x-4 bottom-6 flex min-h-max justify-between rounded-full py-2 px-6 md:hidden'}>
      {getCurrentUserMenu().map(menu => (
        <MenubarMenu key={menu.title + menu.href}>
          <Link href={menu.href}
                className={`min-w-max flex flex-col gap-y-2 items-center justify-between text-gray-500 hover:text-gray-900 ${path.startsWith(menu.href) ? '!text-primary' : ''}`}>
            {menu.icon}
            <span className={"text-[9px]"}>
              {menu.title}
            </span>
          </Link>
        </MenubarMenu>
      ))}
      <MenubarMenu>
        <SidebarTrigger />
      </MenubarMenu>
    </Menubar>
  )
}