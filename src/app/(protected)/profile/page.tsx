import { getProfileStats } from '@/actions/profile'
import { getUserDocumentsList } from '@/actions/documents'
import { ProfileStats } from '@/components/profile/profile-stats'
import { DocumentsSection } from '@/components/profile/documents-section'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function ProfilePage() {
  const t = await getTranslations('profile')

  const [stats, documents] = await Promise.all([
    getProfileStats(),
    getUserDocumentsList()
  ])

  if (!stats) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('error.title')}</AlertTitle>
        <AlertDescription>{t('error.loading_failed')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container space-y-8 py-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileStats stats={stats} />
      </div>

      <DocumentsSection
        documents={documents}
      />
    </div>
  )
}