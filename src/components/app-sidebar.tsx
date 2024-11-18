"use client"

import * as React from "react"
import {
  Command,
  LifeBuoy, LucideIcon,
  Send,
  UserRoundIcon,
  BellRingIcon
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
import { useCurrentUser } from '@/hooks/use-current-user'
import { Route } from 'next'
import { useTranslations } from 'next-intl'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { UserRole } from '@prisma/client'

export type MenuItem = {
  title: string,
  url: Route,
  icon: LucideIcon,
  isActive: boolean,
  items?: SubMenuItem[]
}

export type SubMenuItem = {
  title: string,
  url: Route,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser()
  const t_nav = useTranslations("navigation")
  const userCountry = "France"


  function getCurrentUserMenu(): MenuItem[] {
    if (user?.role) {
      return menus[user.role]
    }
    return []
  }

  const mainUserMenu: MenuItem[] = [{
    title: t_nav("exapmle"),
    url: PAGE_ROUTES.dashboard,
    icon: UserRoundIcon,
    isActive: true,
  }, {
    title: t_nav("notifications"),
    url: PAGE_ROUTES.base,
    icon: BellRingIcon,
    isActive: true
  }]

  const mainAdminMenu: MenuItem[] = [{
    title: t_nav("example"),
    url: PAGE_ROUTES.base,
    icon: UserRoundIcon,
    isActive: true,
    items: [
      {
        title: "examples 1",
        url: "#base",
      },
      {
        title: "example 2",
        url: "#documents",
      }
    ],
  }
  ]

  const navSecondary: MenuItem[] = [{
    title: 'Assistance',
    url: '#',
    icon: LifeBuoy,
    isActive: false,
  },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
      isActive: false,
    }]

  const menus = {
    [UserRole.USER]: mainUserMenu,
    [UserRole.ADMIN]: mainAdminMenu,
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Consulat</span>
                  <span className="truncate text-xs">{userCountry}</span>
                </div>
              </a>
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
          avatar: user.image ?? ''
        }} />
      </SidebarFooter>}
    </Sidebar>
  )
}