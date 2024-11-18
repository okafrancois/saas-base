import { UserRole } from "@prisma/client"
import { Route } from 'next'
import { LucideIcon } from 'lucide-react'

export type LayoutProps = {
  children: React.ReactNode
}

export type NavItem = {
  title: string
  href: Route<string>
  icon: LucideIcon
  roles?: UserRole[]
  items?: Omit<NavItem, 'icon' | 'items'>[]
}