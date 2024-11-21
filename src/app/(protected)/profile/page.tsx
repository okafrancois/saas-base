import { Suspense } from 'react'
import { getUserByIdWithProfile } from '@/lib/user/getters'
import { getProfileStats } from '@/actions/profile'
import { getUserDocumentsList } from '@/actions/documents'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { PAGE_ROUTES } from '@/schemas/app-routes'

import { ProfileHeaderClient } from '@/components/profile/profile-header-client'
import { ProfileInfoSection } from '@/components/profile/profile-info-section'
import { ProfileStats } from '@/components/profile/profile-stats'
import { DocumentsSectionClient } from '@/components/profile/documents-section-client'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(PAGE_ROUTES.login)
  }

  const [userWithProfile, stats, documents] = await Promise.all([
    getUserByIdWithProfile(user.id),
    getProfileStats(),
    getUserDocumentsList()
  ])

  if (!userWithProfile) {
    redirect(PAGE_ROUTES.dashboard)
  }

  return (
    <div className="container space-y-6 py-6 md:py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <ProfileHeaderClient user={userWithProfile} />

        <div className="grid gap-6 md:grid-cols-2">
          {userWithProfile.profile && (
            <ProfileInfoSection profile={userWithProfile.profile} />
          )}
          {stats && <ProfileStats stats={stats} />}
        </div>

        <DocumentsSectionClient documents={documents} />
      </Suspense>
    </div>
  )
}