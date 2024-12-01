import { Suspense } from 'react'
import { getUserProcedureRequests } from '@/actions/procedures'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ProcedureRequestCard } from '@/components/procedures/procedure-request-card'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

export default async function ProcedureRequestsPage() {
  const t = await getTranslations('procedures')

  const requests = await getUserProcedureRequests()

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('requests.title')}</h1>
        <p className="text-muted-foreground">{t('requests.description')}</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        {requests.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t('requests.empty.title')}
            description={t('requests.empty.description')}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <ProcedureRequestCard
                key={request.id}
                request={request}
                onView={(id) => redirect(ROUTES.procedure_edit(id))}
              />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  )
}