import React, { Suspense } from 'react'
import { getUserByIdWithProfile } from '@/lib/user/getters'
import { getProfileStats } from '@/actions/profile'
import { getUseProfileDocuments, getUserDocumentsList } from '@/actions/documents'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { PAGE_ROUTES } from '@/schemas/app-routes'

import { ProfileHeaderClient } from '@/components/profile/profile-header-client'
import { ProfileInfoSection } from '@/components/profile/profile-info-section'
import { ProfileStats } from '@/components/profile/profile-stats'
import { DocumentsSectionClient } from '@/components/profile/documents-section-client'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { InfoIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  const t = await getTranslations('profile')

  if (!user) {
    redirect(PAGE_ROUTES.login)
  }

  const [userWithProfile, stats, documents] = await Promise.all([
    getUserByIdWithProfile(user.id),
    getProfileStats(),
    getUseProfileDocuments()
  ])

  if (!userWithProfile) {
    redirect(PAGE_ROUTES.dashboard)
  }

  if (!userWithProfile.profile) {
    return (
      <div className={"container flex flex-col gap-4"}>
        <Card>
          <CardHeader>
            <CardTitle>
              {t('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className={"flex flex-col gap-4 items-center"}>
            <p className="text-muted-foreground">{t('no_profile')}</p>
            <Link
              href={PAGE_ROUTES.registration}
              className={
                buttonVariants({
                  variant: 'default',
                }) + 'w-max'
              }
            >
              <Plus className="h-4 w-4" />
              {t('actions.create')}
            </Link>
          </CardContent>
        </Card>
        <div className="flex gap-2 items-center">
          <InfoIcon className="size-5 text-primary" />
          <h3 className="font-medium">
            {t('no_profile_help')}
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className="container space-y-6 py-6 md:py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <ProfileHeaderClient user={userWithProfile} />

        <div className="grid gap-6 md:grid-cols-2">
          <ProfileInfoSection profile={userWithProfile.profile} />
          {stats && <ProfileStats stats={stats} />}
        </div>

        <DocumentsSectionClient documents={documents} />
      </Suspense>
    </div>
  )
}