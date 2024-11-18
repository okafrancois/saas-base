import {
  Command,
  LifeBuoy,
  Send,Home, FileText, User, Folder, LayoutDashboard, Users, Settings,
} from 'lucide-react'

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { UserRole } from '@prisma/client'
import { NavItem } from '@/components/layouts/types'
import { getCurrentUser } from '@/actions/user'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = await getCurrentUser()
  const t_nav = await getTranslations("navigation")
  const t_user = await getTranslations("user")
  const t_admin = await getTranslations("admin")
  const userCountry = "France"

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

  const navSecondary: NavItem[] = [{
    title: t_nav('assistance'),
    href: PAGE_ROUTES.base,
    icon: <LifeBuoy />,
    isActive: false,
  },
    {
      title: t_nav('feedback'),
      href: PAGE_ROUTES.base,
      icon: <Send/>,
      isActive: false,
    }]

  const menus = {
    [UserRole.USER]: userMenu,
    [UserRole.RESPONSIBLE]: adminMenu,
    [UserRole.SUPER_ADMIN]: adminMenu,
    [UserRole.ADMIN]: adminMenu,
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={PAGE_ROUTES.base}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Consulat</span>
                  <span className="truncate text-xs">{userCountry}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getCurrentUserMenu()} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      {user && <SidebarFooter>
        <NavUser user={{
          name: user.name ?? '',
          identifier: user?.email ?? user?.phone ?? '',
          avatar: undefined
        }} />
      </SidebarFooter>}
    </Sidebar>
  )
}