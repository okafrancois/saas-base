import { FullProfile } from '@/lib/models-types'
import { DeleteProfileButton } from '@/components/profile/profile-actions'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

type ProfileSettingsProps = Readonly<{
  data: FullProfile
}>

export default function ProfileSettings({ data }: ProfileSettingsProps) {
  const t = useTranslations('profile')

  return (
    <Card className="profile-settings flex flex-col gap-4">
      <CardHeader>
        <h3>{t('sections.settings')}</h3>
      </CardHeader>
      <CardContent>
        <DeleteProfileButton id={data.id} />
      </CardContent>
    </Card>
  )
}