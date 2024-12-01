import { Suspense } from 'react'
import { getAvailableProcedures } from '@/actions/procedures'
import { getUserProfile } from '@/lib/user/getters'
import { getCurrentUser } from '@/actions/user'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ProceduresList } from '@/components/procedures/procedures-list'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'

export default async function ProceduresPage() {
  const t = await getTranslations('procedures')
  const user = await getCurrentUser()

  if (!user) {
    redirect(ROUTES.login)
  }

  const [procedures, profile] = await Promise.all([
    getAvailableProcedures(),
    getUserProfile(user.id)
  ])

  // Déterminer les procédures désactivées en fonction du profil
  const disabledProcedures = procedures.filter(procedure => {
    // Vérifier si le profil est complet pour cette procédure
    const hasRequiredDocuments = procedure.requiredDocuments.every(
      doc => profile?.documents?.some(d => d.type === doc)
    )
    return !hasRequiredDocuments
  }).map(p => p.id)

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <ProceduresList
          procedures={procedures}
          disabledProcedures={disabledProcedures}
          onStartProcedure={(id) => redirect(ROUTES.procedure_start(id))}
        />
      </Suspense>
    </div>
  )
}