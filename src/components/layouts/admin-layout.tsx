import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { getTranslations } from 'next-intl/server'
import { ProtectedLayoutProps } from "@/types/layout"
import { PAGE_ROUTES } from "@/schemas/app-routes"
import { NavItem } from '@/components/layouts/types'
import { FileText, LayoutDashboard, Settings, Users } from 'lucide-react'

export async function AdminLayout({ children }: ProtectedLayoutProps) {
  const session = await auth()
  const t = await getTranslations('admin')

  // Vérifier si l'utilisateur est admin
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect(PAGE_ROUTES.unauthorized)
  }


  const navItems: NavItem[] = [
    {
      title: t('nav.dashboard'),
      href: PAGE_ROUTES.admin_dashboard,
      icon: LayoutDashboard,
    },
    {
      title: t('nav.users'),
      href: PAGE_ROUTES.admin_users,
      icon: Users,
    },
    {
      title: t('nav.requests'),
      href: PAGE_ROUTES.admin_requests,
      icon: FileText,
    },
    {
      title: t('nav.settings'),
      href: PAGE_ROUTES.admin_settings,
      icon: Settings,
    }
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar items={navItems}/>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  )
}