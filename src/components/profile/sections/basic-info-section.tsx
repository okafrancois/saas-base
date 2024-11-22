'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { NationalityAcquisition, Profile } from '@prisma/client'
import { BasicInfoSchema, type BasicInfoFormData } from '@/schemas/registration'
import { EditableSection } from '../editable-section'
import { useToast } from '@/hooks/use-toast'
import { postProfile } from '@/actions/profile'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BasicInfoForm } from '@/components/registration/basic-info'

interface BasicInfoSectionProps {
  profile: Profile
}

interface InfoFieldProps {
  label: string
  value?: string | null
  required?: boolean
  isCompleted?: boolean
  className?: string
}

function InfoField({ label, value, className = '', required, isCompleted = !!value }: InfoFieldProps) {
  const t = useTranslations('registration')

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">{label}</div>
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

export function BasicInfoSection({ profile }: BasicInfoSectionProps) {
  const t = useTranslations('registration')
  const t_sections = useTranslations('profile.sections')
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: profile.gender,
      birthDate: profile.birthDate,
      birthPlace: profile.birthPlace,
      birthCountry: profile.birthCountry,
      nationality: profile.nationality,
      acquisitionMode: profile.acquisitionMode ?? NationalityAcquisition.BIRTH,
      passportNumber: profile.passportNumber,
      passportIssueDate: profile.passportIssueDate.toISOString().split('T')[0],
      passportExpiryDate: profile.passportExpiryDate.toISOString().split('T')[0],
      passportIssueAuthority: profile.passportIssueAuthority,
      identityPictureFile: null
    }
  })

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const data = form.getValues()

      const formData = new FormData()
      if (data.identityPictureFile) {
        formData.append('identityPictureFile', data.identityPictureFile)
      }
      formData.append('basicInfo', JSON.stringify(data))

      const result = await postProfile(formData)

      if (result.error) {
        toast({
          title: t('messages.errors.update_failed'),
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: t('messages.success.update_title'),
        description: t('messages.success.update_description'),
        variant: "success"
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: t('messages.errors.update_failed'),
        description: t('messages.errors.unknown'),
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

  return (
    <EditableSection
      title={t_sections('basic_info')}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      isLoading={isLoading}
    >
      {isEditing ? (
        <BasicInfoForm
          form={form}
          onSubmit={handleSave}
          isLoading={isLoading}
        />
      ) : (
        <div className="space-y-6">
          {/* Informations d'identité */}
          <div className="grid gap-4 grid-cols-2">
            <InfoField
              label={t('form.first_name')}
              value={profile.firstName}
              required
              className={"col-span-1"}
            />
            <InfoField
              label={t('form.last_name')}
              value={profile.lastName}
              required
              className={"col-span-1"}
            />
            <InfoField
              label={t('form.gender')}
              value={t(`assets.gender.${profile.gender.toLowerCase()}`)}
              required
            />
            <InfoField
              label={t('form.birth_date')}
              value={format(new Date(profile.birthDate), 'PPP', { locale: fr })}
              required
            />
            <InfoField
              label={t('form.birth_place')}
              value={profile.birthPlace}
              required
            />
            <InfoField
              label={t('form.birth_country')}
              value={profile.birthCountry}
              required
            />
            <InfoField
              label={t('form.nationality')}
              value={profile.nationality}
              required
            />
            <InfoField
              label={t('nationality_acquisition.label')}
              value={t(`nationality_acquisition.modes.${profile.acquisitionMode?.toLowerCase()}`)}
              required
            />
          </div>

          {/* Informations du passeport */}
          <div className="mt-4 space-y-4">
            <h4 className="font-medium">
              {t('form.passport.section_title')}
            </h4>
            <div className="grid gap-4 grid-cols-2">
              <InfoField
                label={t('form.passport.number.label')}
                value={profile.passportNumber}
                required
                className={"col-span-2"}
              />
              <InfoField
                label={t('form.passport.authority.label')}
                value={profile.passportIssueAuthority}
                required
                className={"col-span-2"}
              />
              <InfoField
                label={t('form.passport.issue_date.label')}
                value={format(new Date(profile.passportIssueDate), 'PPP', { locale: fr })}
                required
              />
              <InfoField
                label={t('form.passport.expiry_date.label')}
                value={format(new Date(profile.passportExpiryDate), 'PPP', { locale: fr })}
                required
              />
            </div>
          </div>
        </div>
      )}
    </EditableSection>
  )
}