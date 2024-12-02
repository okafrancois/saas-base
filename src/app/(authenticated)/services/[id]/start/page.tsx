import { Suspense } from 'react'
import { getServiceById } from '@/actions/consular-services/get'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ServiceForm } from '@/components/consular-services/service-form'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'
import { getUserDocumentsList } from '@/actions/documents'

interface ServiceStartPageProps {
  params: {
    id: string
  }
}

export default async function ServiceStartPage({ params }: ServiceStartPageProps) {
  const [service, documents] = await Promise.all([
    getServiceById(params.id),
    getUserDocumentsList()
  ])

  if (!service) {
    redirect(ROUTES.services)
  }

  return (
    <div className="container max-w-4xl py-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <ServiceForm
          service={service}
          documents={documents}
        />
      </Suspense>
    </div>
  )
}