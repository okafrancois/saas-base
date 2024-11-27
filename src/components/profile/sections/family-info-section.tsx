'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { MaritalStatus, Profile } from '@prisma/client'
import { FamilyInfoSchema, type FamilyInfoFormData } from '@/schemas/registration'
import { EditableSection } from '../editable-section'
import { useToast } from '@/hooks/use-toast'
import { updateProfile } from '@/actions/profile'
import { Badge } from '@/components/ui/badge'
import { Users, User2, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { FamilyInfoForm } from '@/components/registration/family-info'

interface FamilyInfoSectionProps {
  profile: Profile & {
    emergencyContact?: {
      fullName: string
      relationship: string
      phone: string
    } | null
  }
}

interface InfoFieldProps {
  label: string
  value?: string | null
  required?: boolean
  isCompleted?: boolean
  icon?: React.ReactNode
}

function InfoField({ label, value, required, isCompleted = !!value, icon }: InfoFieldProps) {
  const t = useTranslations('registration')

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>
        {!isCompleted && (
          <Badge
            variant={required ? "destructive" : "secondary"}
            className="text-xs"
          >
            {t(required ? 'form.required' : 'form.optional')}
          </Badge>
        )}
      </div>
      <div className="mt-1">
        {value || (
          <span className="text-sm italic text-muted-foreground">
            {t('form.not_provided')}
          </span>
        )}
      </div>
    </div>
  )
}

export function FamilyInfoSection({ profile }: FamilyInfoSectionProps) {
  const t = useTranslations('registration')
  const t_messages = useTranslations('messages.profile')
  const t_assets = useTranslations('assets')
  const t_sections = useTranslations('profile.sections')
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FamilyInfoFormData>({
    resolver: zodResolver(FamilyInfoSchema),
    defaultValues: {
      maritalStatus: profile.maritalStatus ?? MaritalStatus.SINGLE,
      fatherFullName: profile.fatherFullName || '',
      motherFullName: profile.motherFullName || '',
      spouseFullName: profile.spouseFullName || '',
      emergencyContact: profile.emergencyContact || undefined
    }
  })

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const data = form.getValues()

      const formData = new FormData()
      formData.append('familyInfo', JSON.stringify(data))

      const result = await updateProfile(formData, 'familyInfo')

      if (result.error) {
        toast({
          title: t_messages('errors.update_failed'),
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: t_messages('success.update_title'),
        description: t_messages('success.update_description'),
        variant: "success"
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: t_messages('errors.update_failed'),
        description: t_messages('errors.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  const showSpouseField = profile.maritalStatus === 'MARRIED'

  return (
    <EditableSection
      title={t_sections('family_info')}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      isLoading={isLoading}
    >
      {isEditing ? (
        <FamilyInfoForm
          form={form}
          onSubmit={handleSave}
          isLoading={isLoading}
        />
      ) : (
        <div className="space-y-6">
          {/* Situation matrimoniale */}
          <div className="space-y-4">
            <InfoField
              label={t('form.marital_status')}
              value={t_assets(`marital_status.${profile.maritalStatus?.toLowerCase()}`)}
              icon={<Users className="h-4 w-4" />}
              required
            />

            {showSpouseField && (
              <InfoField
                label={t('form.spouse_name')}
                value={profile.spouseFullName}
                icon={<User2 className="h-4 w-4" />}
                required
              />
            )}
          </div>

          {/* Parents */}
          <div className="grid gap-4">
            <InfoField
              label={t('form.father_name')}
              value={profile.fatherFullName}
              icon={<User2 className="h-4 w-4" />}
              required
            />
            <InfoField
              label={t('form.mother_name')}
              value={profile.motherFullName}
              icon={<User2 className="h-4 w-4" />}
              required
            />
          </div>

          {/* Contact d'urgence */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t('form.emergency_contact')}</h4>
                  {!profile.emergencyContact && (
                    <Badge variant="destructive">
                      {t('form.required')}
                    </Badge>
                  )}
                </div>

                {profile.emergencyContact ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoField
                      label={t('form.emergency_contact_name')}
                      value={profile.emergencyContact.fullName}
                      icon={<User2 className="h-4 w-4" />}
                    />
                    <InfoField
                      label={t('form.emergency_contact_relationship')}
                      value={profile.emergencyContact.relationship}
                      icon={<Users className="h-4 w-4" />}
                    />
                    <InfoField
                      label={t('form.emergency_contact_phone')}
                      value={profile.emergencyContact.phone}
                      icon={<Phone className="h-4 w-4" />}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('form.emergency_contact_description')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </EditableSection>
  )
}