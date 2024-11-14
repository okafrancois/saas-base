import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConsulateFormContent } from '@/components/consulate/consulate-form'
import { getConsulate } from '@/actions/consulate'
import ConsulateView from '@/components/consulate/consulate-view'
import ConsulateSettings from '@/components/consulate/consulate-settings'
import * as React from 'react'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: { id: string }
}

enum mode {
  OVERVIEW = 'overview',
  DASHBOARD = 'dashboard',
  SETTINGS = 'settings',
}

export default async function SingleConsulatePage({ params }: Readonly<Props>) {
  const t = await getTranslations('consulate')
  const data = await getConsulate(params.id)

  return (
    <div className="container py-6">
      <Tabs defaultValue={mode.OVERVIEW}>
        <TabsList className={'grid w-full grid-cols-3 rounded-full bg-input'}>
          {Object.values(mode).map((value) => (
            <TabsTrigger key={value} value={value}>
              {t(`tabs.${value}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="pt-4">
          <TabsContent value={mode.OVERVIEW}>
            <ConsulateView
              data={data}
              showActions={{
                contact: true,
                share: true,
                message: true,
                card: true,
              }}
            />
          </TabsContent>
          <TabsContent value={mode.SETTINGS}>
            <ConsulateFormContent data={data} />
            <ConsulateSettings data={data} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}