import { Suspense } from 'react'
import { getAvailableServices } from '@/actions/consular-services/get'
import { getCurrentUser } from '@/actions/user'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ServicesList } from '@/components/consular-services/services-list'
import { ServicesHeader } from '@/components/consular-services/services-header'
import { getUserDocumentsList } from '@/actions/documents'

export default async function ServicesPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const [services, documents] = await Promise.all([
    getAvailableServices(),
    getUserDocumentsList()
  ])

  // Déterminer les services désactivés en fonction du profil
  const disabledServices = services.filter(service => {
    // Vérifier si le profil est complet pour ce service
    const hasRequiredDocuments = service.requiredDocuments.every(
      doc => documents?.some(d => d.type === doc)
    )
    return !hasRequiredDocuments
  }).map(s => s.id)

  return (
    <div className="container py-6">
      <ServicesHeader />

      <Suspense fallback={<LoadingSkeleton />}>
        <ServicesList
          services={services}
          disabledServices={disabledServices}
        />
      </Suspense>
    </div>
  )
}