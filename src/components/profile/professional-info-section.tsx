import { Profile } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Building2, MapPin } from 'lucide-react'

interface ProfessionalInfoSectionProps {
  profile: Profile
}

export function ProfessionalInfoSection({ profile }: ProfessionalInfoSectionProps) {
  const t = useTranslations('profile')
  const t_assets = useTranslations('assets')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.professional_info')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statut professionnel */}
        <div className="space-y-2">
          <h4 className="font-medium">{t('professional.status')}</h4>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>
              {t_assets(`work_status.${profile.workStatus?.toLowerCase()}`)}
            </span>
          </div>
        </div>

        {/* Informations employeur */}
        {profile.employer && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">{t('professional.employer')}</h4>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{profile.employer}</span>
              </div>
            </div>

            {profile.employerAddress && (
              <div className="space-y-2">
                <h4 className="font-medium">{t('professional.work_address')}</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                  <p>{profile.employerAddress}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dernière activité au Gabon */}
        {profile.activityInGabon && (
          <div className="space-y-2">
            <h4 className="font-medium">{t('professional.last_activity_gabon')}</h4>
            <p>{profile.activityInGabon}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}