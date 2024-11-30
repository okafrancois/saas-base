import { Suspense } from 'react'
import { getDashboardStats } from '@/lib/services/dashboard/dashboard'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ProfileSection } from '@/components/profile/dashboard/sections/profile-section'
import { RequestsSection } from '@/components/profile/dashboard/sections/requests-section'
import { AppointmentsSection } from '@/components/profile/dashboard/sections/appointments-section'
import { getCurrentUser } from '@/actions/user'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const stats = await getDashboardStats(user.id)

  return (
    <>
      {/* Contenu principal */}
      <div className="container pb-20 pt-4 md:py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          {/* Section profil - toujours en haut sur mobile */}
          <div className="mb-6">
            <ProfileSection stats={stats.profile} />
          </div>

          {/* Grille responsive pour les autres sections */}
          <div className="grid gap-4 md:grid-cols-2">
            <RequestsSection stats={stats.requests}/>
            <AppointmentsSection stats={stats.appointments}/>
          </div>
        </Suspense>
      </div>
    </>
  )
}