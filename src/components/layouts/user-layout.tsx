import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UserSidebar } from "@/components/user/sidebar"
import { UserHeader } from "@/components/user/header"
import { getTranslations } from 'next-intl/server'
import { ProtectedLayoutProps } from "@/types/layout"
import { PAGE_ROUTES } from "@/schemas/app-routes"
import { NavItem } from '@/components/layouts/types'
import { FileText, Folder, Home, User } from 'lucide-react'

export async function UserLayout({ children }: ProtectedLayoutProps) {
  const session = await auth()
  const t = await getTranslations('user')

  if (!session?.user) {
    redirect(PAGE_ROUTES.login)
  }

  const navItems: NavItem[] = [
    {
      title: t('nav.dashboard'),
      href: PAGE_ROUTES.dashboard,
      icon: Home,
    },
    {
      title: t('nav.requests'),
      href: PAGE_ROUTES.requests,
      icon: FileText,
    },
    {
      title: t('nav.profile'),
      href: PAGE_ROUTES.profile,
      icon: User,
    },
    {
      title: t('nav.documents'),
      href: PAGE_ROUTES.documents,
      icon: Folder,
    }
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar items={navItems} />

      <div className="flex-1 flex flex-col">
        <UserHeader />

        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}