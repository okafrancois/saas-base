import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { MenuBarMobile } from '@/components/menu-bar-mobile'
import AppSidebar from '@/components/ui/app-sidebar'

export default async function AuthenticatedLayout({
                                                    children,
                                                  }: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  if (!session) {
    return null
  }

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <AppSidebar/>
          <main className={'min-h-screen w-screen overflow-auto overflow-x-hidden bg-muted pb-16 pt-4 md:py-6'}>
            {children}
          </main>
        <MenuBarMobile />
      </SidebarProvider>
    </SessionProvider>
  )
}