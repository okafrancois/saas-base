'use client'

import { useCurrentUser } from '@/hooks/use-current-user'
import { useTranslations } from 'next-intl'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import {
  Calendar,
  FileText, FolderOpen,
  LayoutDashboard,
  Settings,
  User,
  Users,
} from 'lucide-react'
import { UserRole } from '@prisma/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavItem } from '@/components/layouts/types'
import { cn } from '@/lib/utils'

export function MenuBarMobile() {
  const path = usePathname()
  const user = useCurrentUser()
  const t = useTranslations("common")
  const t_admin= useTranslations('admin')

  const userMenu: NavItem[] = [
    {
      title: t('nav.profile'),
      href: PAGE_ROUTES.profile,
      icon: <User className={"size-5"}/>,
    },
    {
      title: t('nav.requests'),
      icon: <FileText className={"size-5"}/>,
      href: PAGE_ROUTES.requests
    },
    {
      title: t('nav.appointments'),
      icon: <Calendar className={"size-5"} />,
      href: PAGE_ROUTES.appointments
    },
    {
      title: t('nav.documents'),
      icon: <FolderOpen className={"size-5"} />,
      href: PAGE_ROUTES.documents
    },
    {
      title: t('nav.settings'),
      icon: <Settings className={"size-5"} />,
      href: PAGE_ROUTES.settings
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
    <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
      <nav className="bg-background border-t px-2 py-3">
        <div className="flex items-center justify-around">
          {getCurrentUserMenu().map((item) => {
            const isActive = path === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                <span className="text-xs">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}