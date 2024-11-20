import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileTextIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import {
  BasicInfoFormData,
  ContactInfoFormData,
  DocumentsFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration'

interface ReviewFormProps {
  data: {
    documents?: Partial<DocumentsFormData>
    basicInfo?: Partial<BasicInfoFormData>
    familyInfo?: Partial<FamilyInfoFormData>
    contactInfo?: Partial<ContactInfoFormData>
    professionalInfo?: Partial<ProfessionalInfoFormData>
  }
  onSubmit?: () => void
}

const InfoField = ({
                     label,
                     value,
                     isRequired = false,
                   }: {
  label: string
  value?: string | null
  isRequired?: boolean
}) => {
  const t = useTranslations('registration')

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {isRequired && !value && (
          <Badge variant="destructive" className="text-xs">
            {t('review.required')}
          </Badge>
        )}
      </div>
      <p className="font-medium">
        {value || (
          <span className="italic text-muted-foreground">
            {t('review.not_provided')}
          </span>
        )}
      </p>
    </div>
  )
}

const DocumentBadge = ({
                         isUploaded,
                         label,
                         isRequired = true,
                         className,
                       }: {
  isUploaded?: boolean
  label: string
  isRequired?: boolean
  className?: string
}) => {
  const t = useTranslations('registration')

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <FileTextIcon className="size-4" />
      <span>{label}</span>
      <Badge
        variant={isUploaded ? 'outline' : 'destructive'}
      >
        {isUploaded
          ? t('review.document_uploaded')
          : isRequired
            ? t('review.document_missing')
            : t('review.not_provided')}
      </Badge>
    </div>
  )
}

export function ReviewForm({ data }: Readonly<ReviewFormProps>) {
  const t = useTranslations('registration')
  const t_assets = useTranslations('assets')
  const t_countries = useTranslations('countries')

  return (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('review.basic_info')}
            {!data.basicInfo && (
              <Badge variant="destructive">{t('review.section_missing')}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              label={t('form.first_name')}
              value={data.basicInfo?.firstName}
              isRequired
            />
            <InfoField
              label={t('form.last_name')}
              value={data.basicInfo?.lastName}
              isRequired
            />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              label={t('form.gender')}
              value={data.basicInfo?.gender ? t_assets(`gender.${data.basicInfo.gender.toLowerCase()}`) : undefined}
              isRequired
            />
            <InfoField
              label={t('form.birth_date')}
              value={data.basicInfo?.birthDate ? new Date(data.basicInfo.birthDate).toLocaleDateString() : undefined}
              isRequired
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              label={t('form.birth_place')}
              value={data.basicInfo?.birthPlace}
              isRequired
            />
            <InfoField
              label={t('form.birth_country')}
              value={data.basicInfo?.birthCountry ? t_countries(data.basicInfo.birthCountry) : undefined}
              isRequired
            />
            <InfoField
              label={t('nationality_acquisition.label')}
              value={data.basicInfo?.acquisitionMode ? t(`nationality_acquisition.options.${data.basicInfo.acquisitionMode.toLowerCase()}`) : undefined}
              isRequired
            />
          </div>
        </CardContent>
      </Card>

      {/* Informations de contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('review.contact_info')}
            {!data.contactInfo && (
              <Badge variant="destructive">{t('review.section_missing')}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              label={t('form.email')}
              value={data.contactInfo?.email}
            />
            <InfoField
              label={t('form.phone')}
              value={data.contactInfo?.phone}
            />
          </div>
          <Separator />
          {data.contactInfo?.address ? (
            <div>
              <span className="text-sm text-muted-foreground">{t('form.address')}</span>
              <p className="font-medium">
                {data.contactInfo.address.firstLine}
                {data.contactInfo.address.secondLine && (
                  <>, {data.contactInfo.address.secondLine}</>
                )}
              </p>
              <p className="font-medium">
                {data.contactInfo.address.zipCode} {data.contactInfo.address.city}
              </p>
              <p className="font-medium">
                {t_countries(data.contactInfo.address.country)}
              </p>
            </div>
          ) : (
            <InfoField
              label={t('form.address')}
              value={undefined}
              isRequired
            />
          )}

          {data.contactInfo?.addressInGabon ? (
            <>
              <Separator />
              <div>
                <span className="text-sm text-muted-foreground">{t('form.address_gabon')}</span>
                <p className="font-medium">{data.contactInfo.addressInGabon.address}</p>
                <p className="font-medium">
                  {data.contactInfo.addressInGabon.district}, {data.contactInfo.addressInGabon.city}
                </p>
              </div>
            </>
          ) : (
            <InfoField
              label={t('form.address_gabon')}
              value={undefined}
            />
          )}
        </CardContent>
      </Card>

      {/* Informations familiales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('review.family_info')}
            {!data.familyInfo && (
              <Badge variant="destructive">{t('review.section_missing')}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <InfoField
            label={t('form.marital_status')}
            value={data.familyInfo?.maritalStatus ? t_assets(`marital_status.${data.familyInfo.maritalStatus.toLowerCase()}`) : undefined}
          />
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <InfoField
              label={t('form.father_name')}
              value={data.familyInfo?.fatherFullName}
              isRequired
            />
            <InfoField
              label={t('form.mother_name')}
              value={data.familyInfo?.motherFullName}
              isRequired
            />
          </div>

          {data.familyInfo?.emergencyContact ? (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">{t('form.emergency_contact')}</span>
                <p className="font-medium">{data.familyInfo.emergencyContact.fullName}</p>
                <p className="text-sm">
                  {t('form.emergency_contact_relationship')}: {data.familyInfo.emergencyContact.relationship}
                </p>
                <p className="text-sm">
                  {t('form.emergency_contact_phone')}: {data.familyInfo.emergencyContact.phone}
                </p>
              </div>
            </>
          ) : (
            <InfoField
              label={t('form.emergency_contact')}
              value={undefined}
            />
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('review.documents')}
            {!data.documents && (
              <Badge variant="destructive">{t('review.section_missing')}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-4">
          <DocumentBadge
            isUploaded={!!data.documents?.passportFile}
            label={t('form.passport')}
            isRequired
          />
          <DocumentBadge
            isUploaded={!!data.basicInfo?.identityPictureFile}
            label={t('form.identity_picture')}
            isRequired
          />
          <DocumentBadge
            isUploaded={!!data.documents?.birthCertificateFile}
            label={t('form.birth_certificate')}
            isRequired
          />
          <DocumentBadge
            isUploaded={!!data.documents?.residencePermitFile}
            label={t('form.residence_permit')}
            isRequired
          />
          <DocumentBadge
            isUploaded={!!data.documents?.addressProofFile}
            label={t('form.address_proof')}
            isRequired
          />
        </CardContent>
      </Card>
    </div>
  )
}