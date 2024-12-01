import { Suspense } from 'react'
import { getProcedureRequest } from '@/actions/procedures'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ProcedureForm } from '@/components/procedures/procedure-form'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'

interface ProcedureStartPageProps {
  params: {
    id: string
  }
}

export default async function ProcedureStartPage({ params }: ProcedureStartPageProps) {
  const t = await getTranslations('procedures')

  const procedure = await getProcedureRequest(params.id)
  if (!procedure) {
    redirect(ROUTES.procedures)
  }

  const handleSubmit = async (data: any) => {
    'use server'
    // Implémenter la logique de soumission
    redirect(ROUTES.procedures)
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t(`types.${procedure.type.toLowerCase()}`)}
        </h1>
        <p className="text-muted-foreground">
          {procedure.description}
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <ProcedureForm
          procedure={procedure}
          onSubmit={handleSubmit}
        />
      </Suspense>
    </div>
  )
}