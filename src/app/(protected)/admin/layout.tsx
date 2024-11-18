import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { UserRole } from '@prisma/client'
import { PAGE_ROUTES } from '@/schemas/app-routes'

export default async function AdminLayout({
                                            children
                                          }: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || !(session.user.role === UserRole.ADMIN)) {
    redirect(PAGE_ROUTES.unauthorized)
  }

  return <>{children}</>
}