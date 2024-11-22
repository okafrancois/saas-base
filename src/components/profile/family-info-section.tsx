import { Profile } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Phone, Heart } from 'lucide-react'

interface FamilyInfoSectionProps {
  profile: Profile & {
    emergencyContact?: {
      fullName: string
      relationship: string
      phone: string
    } | null
  }
}

export function FamilyInfoSection({ profile }: FamilyInfoSectionProps) {
  const t = useTranslations('profile')
  const t_assets = useTranslations('assets')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.family_info')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parents */}
        <div className="space-y-4">
          <h4 className="font-medium">{t('family.parents')}</h4>
          <div className="grid gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t('family.father')}
              </p>
              <p>{profile.fatherFullName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t('family.mother')}
              </p>
              <p>{profile.motherFullName}</p>
            </div>
          </div>
        </div>

        {/* Situation matrimoniale */}
        <div className="space-y-2">
          <h4 className="font-medium">{t('family.marital_status')}</h4>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span>
              {t_assets(`marital_status.${profile.maritalStatus?.toLowerCase()}`)}
            </span>
          </div>
          {profile.spouseFullName && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                {t('family.spouse')}
              </p>
              <p>{profile.spouseFullName}</p>
            </div>
          )}
        </div>

        {/* Contact d'urgence */}
        {profile.emergencyContact && (
          <div className="space-y-2">
            <h4 className="font-medium">{t('family.emergency_contact')}</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p>{profile.emergencyContact.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.emergencyContact.relationship}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.emergencyContact.phone}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}