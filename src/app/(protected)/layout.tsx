import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { MenuBarMobile } from '@/components/menu-bar-mobile'

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <main
          className={
            'min-h-screen w-screen overflow-auto overflow-x-hidden bg-muted pb-16 pt-4 md:py-6'
          }
        >
          {children}
        </main>
        <MenuBarMobile />
      </SidebarProvider>
    </SessionProvider>
  )
}