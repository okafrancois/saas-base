import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <main
        className={
          'min-h-screen w-screen overflow-auto overflow-x-hidden bg-muted pb-16 pt-4 md:py-6'
        }
      >
        {children}
      </main>
    </SessionProvider>
  )
}