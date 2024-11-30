import { getCurrentUser } from '@/actions/user'
import { getUserProfile } from '@/lib/user/getters'
import { AVAILABLE_PROCEDURES } from '@/lib/procedures/config'
import { redirect } from 'next/navigation'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { getTranslations } from 'next-intl/server'
import { RequestType } from '@prisma/client'
import { ProcedureForm } from '@/components/procedures/procedure-form'

interface ProcedureFormPageProps {
  params: {
    type: RequestType
  }
}

export default async function ProcedureFormPage({ params }: ProcedureFormPageProps) {
  const t = await getTranslations('procedures')
  const user = await getCurrentUser()

  if (!user) return null

  const procedure = AVAILABLE_PROCEDURES.find(p => p.id === params.type)
  if (!procedure) {
    redirect(PAGE_ROUTES.procedures)
  }

  const profile = await getUserProfile(user.id)

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t(procedure.title)}</h1>
        <p className="text-muted-foreground">{t(procedure.description)}</p>
      </div>

      <ProcedureForm
        procedure={procedure}
        profile={profile}
      />
    </div>
  )
}