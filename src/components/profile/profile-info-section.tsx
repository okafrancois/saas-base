import { Profile } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProfileInfoSectionProps {
  profile: Profile
}

export function ProfileInfoSection({ profile }: ProfileInfoSectionProps) {

  const t = useTranslations('profile')
  const t_assets = useTranslations('assets')
  const t_countries = useTranslations('countries')

  const infoFields = [
    {
      label: t('fields.gender'),
      value: t_assets(`gender.${profile.gender.toLowerCase()}`),
    },
    {
      label: t('fields.birth_date'),
      value: format(new Date(profile.birthDate), 'PPP', { locale: fr }),
    },
    {
      label: t('fields.birth_place'),
      value: `${profile.birthPlace}, ${t_countries(profile.birthCountry)}`,
    },
    {
      label: t('fields.nationality'),
      value: t_countries(profile.nationality),
    },
    {
      label: t('fields.marital_status'),
      value: t_assets(`marital_status.${profile.maritalStatus?.toLowerCase()}`),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.personal_info')}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {infoFields.map((field) => (
            <div key={field.label} className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">
                {field.label}
              </dt>
              <dd className="text-sm">{field.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}