import { ConsulateItem } from '@/components/consulate/consulate-item'
import { getConsulates } from '@/actions/consulate'
import { getTranslations } from 'next-intl/server'

export default async function ConsulateList() {
  const t = await getTranslations('consulate')

  const companies = await getConsulates()

  return (
    <>
      {companies.length === 0 && (
        <div className="text-center">
          <p className="mb-4 text-lg leading-none tracking-tight">
            {t('messages.no_registered_yet')}
          </p>
          <p className={'text-sm text-muted-foreground'}>
            {t('messages.add_consulate_to_start')}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((item) => (
          <ConsulateItem key={item.id} data={item} />
        ))}
      </div>
    </>
  )
}