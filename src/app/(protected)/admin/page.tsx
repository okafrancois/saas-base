import { getCurrentUser } from '@/actions/user'
import { UserRole } from '@prisma/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <Card>
        <CardHeader>
          <h3>Access denied</h3>
        </CardHeader>
        <CardContent>
          <p>{"You don't have access to this page"}</p>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className={'container'}>
      <h1 className={'mb-4 text-2xl font-semibold leading-none tracking-tight'}>
        Admin Page
      </h1>
    </div>
  )
}