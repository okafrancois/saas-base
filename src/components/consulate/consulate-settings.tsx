import { FullConsulate } from '@/lib/models-types'
import { DeleteConsulateButton } from '@/components/consulate/consulate-actions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getTranslations } from 'next-intl/server'

type ProfileSettingsProps = {
  data: FullConsulate
}

export default async function ConsulateSettings({ data }: ProfileSettingsProps) {
  const t = await getTranslations('consulate')

  return (
    <Card className="profile-settings flex flex-col gap-4">
      <CardHeader>
        <h3>{t('sections.profile_settings')}</h3>
      </CardHeader>
      <CardContent>
        <DeleteConsulateButton id={data.id} />
      </CardContent>
    </Card>
  )
}