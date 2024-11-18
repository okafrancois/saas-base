"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from "@/components/ui/sidebar"
import { NavItem } from "@/components/layouts/types"
import { PAGE_ROUTES } from "@/schemas/app-routes"
import {
  Home,
} from "lucide-react"
import { UserNav } from "@/components/ui/user-nav"

interface UserSidebarProps {
  items: NavItem[]
}

export function UserSidebar({items}: UserSidebarProps) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href={PAGE_ROUTES.dashboard}>
                  <Home className="h-4 w-4" />
                  <span>Consulat.ga</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.href}>
                    {item.icon}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <UserNav />
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}