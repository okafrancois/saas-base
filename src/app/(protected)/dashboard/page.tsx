import { Suspense } from 'react'
import { getDashboardStats } from '@/lib/services/dashboard'
import { handleDashboardAction } from '@/lib/services/dashboard/actions'
import { DashboardGrid } from '@/components/dashboard/dashboard-grid'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { getCurrentUser } from '@/actions/user'
import { ProfileSection } from '@/components/dashboard/sections/profile-section'
import { RequestsSection } from '@/components/dashboard/sections/requests-section'
import { ProceduresSection } from '@/components/dashboard/sections/procedures-section'
import { AppointmentsSection } from '@/components/dashboard/sections/appointments-section'
import { DocumentsSection } from '@/components/dashboard/sections/documents-section'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const stats = await getDashboardStats(user.id)

  async function handleAction(section: string, action: string) {
    'use server'
    return handleDashboardAction(section, action, user?.id as string)
  }

  return (
    <div className="container space-y-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ProfileSection
            stats={stats.profile}
          />
          <RequestsSection
            stats={stats.requests}
          />
          <ProceduresSection
            stats={stats.procedures}
          />
          <AppointmentsSection
            stats={stats.appointments}
          />
          <DocumentsSection
            stats={stats.documents}
          />
        </div>
      </Suspense>
    </div>
  )
}