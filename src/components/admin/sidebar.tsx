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
import { useTranslations } from 'next-intl'
import { PAGE_ROUTES } from "@/schemas/app-routes"
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText
} from "lucide-react"
import { UserNav } from "@/components/ui/user-nav"


interface AdminSidebarProps {
  items: NavItem[]
}

export function AdminSidebar({ items }: AdminSidebarProps) {

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href={PAGE_ROUTES.admin_dashboard}>
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Admin Console</span>
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
                    <item.icon className="h-4 w-4" />
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