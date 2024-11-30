import { getCurrentUser } from '@/actions/user'
import { ProceduresList } from '@/components/procedures/procedures-list'
import { getUserProcedures } from '@/lib/procedures/getters'
import { getTranslations } from 'next-intl/server'

export default async function ProceduresPage() {
  const t = await getTranslations('procedures')
  const user = await getCurrentUser()
  if (!user) return null

  const procedures = await getUserProcedures(user.id)

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <ProceduresList userId={user.id} procedures={procedures} />
    </div>
  )
}