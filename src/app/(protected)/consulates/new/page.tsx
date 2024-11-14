import { ConsulateFormContent } from '@/components/consulate/consulate-form'
import { getTranslations } from 'next-intl/server'

export default async function NewCompanyPage() {
  const t = await getTranslations('consulate')

  return (
    <div className="container">
      <h2 className={'mb-6 text-2xl font-semibold leading-none tracking-tight'}>
        {t('actions.add')}
      </h2>
      <ConsulateFormContent />
    </div>
  )
}