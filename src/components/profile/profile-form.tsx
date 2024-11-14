'use client'

import { useRouter } from 'next/navigation'
import { postProfile, updateProfile } from '@/actions/profile'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { FullProfile } from '@/lib/models-types'
import * as React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { DocumentType, Gender, MaritalStatus, NationalityAcquisition, WorkStatus } from '@prisma/client'
import { Form } from '@/components/ui/form'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProfileDataSchema, type ProfileDataInput } from '@/components/consular/schema'
import { useTranslations } from 'next-intl'
import type { Route } from 'next'
import { SectionBasicInfo } from './sections/section-basic-info'
import { SectionContactInfo } from './sections/section-contact-info'
import { SectionFamilyInfo } from './sections/section-family-info'
import { SectionProfessionalInfo } from './sections/section-professional-info'
import { SectionDocuments } from './sections/section-documents'
import { SectionRequestType } from './sections/section-request-type'

type ProfileFormContentProps = {
  data?: FullProfile
}

export function ProfileFormContent({ data }: Readonly<ProfileFormContentProps>) {
  const t = useTranslations('profile')
  const router = useRouter()

  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<ProfileDataInput>({
    resolver: zodResolver(ProfileDataSchema),
    defaultValues: {
      requestType: {
        documentType: data?.documentType ?? DocumentType.FIRST_REQUEST,
        nationalityAcquisition: data?.nationalityAcquisition ?? NationalityAcquisition.BIRTH
      },
      basicInfo: {
        gender: data?.gender ?? Gender.MALE,
        firstName: data?.firstName ?? '',
        lastName: data?.lastName ?? '',
        birthDate: data?.birthDate ?? '',
        birthPlace: data?.birthPlace ?? '',
        birthCountry: data?.birthCountry ?? '',
        nationality: 'gabonaise',
        identityPictureFile: undefined
      },
      contactInfo: {
        email: data?.email ?? '',
        phone: data?.phone ?? '',
        address: {
          firstLine: data?.address.firstLine ?? '',
          secondLine: data?.address.secondLine ?? '',
          city: data?.address.city ?? '',
          zipCode: data?.address.zipCode ?? '',
          country: data?.address.country ?? ''
        }
      },
      familyInfo: {
        maritalStatus: data?.maritalStatus ?? MaritalStatus.SINGLE,
        fatherFullName: data?.fatherFullName ?? '',
        motherFullName: data?.motherFullName ?? '',
        spouseFullName: data?.spouseFullName ?? '',
        emergencyContact: data?.emergencyContact ?? {
          fullName: '',
          relationship: '',
          phone: ''
        }
      },
      professionalInfo: {
        workStatus: data?.workStatus ?? WorkStatus.OTHER,
        profession: data?.profession ?? '',
        employer: data?.employer ?? '',
        employerAddress: data?.employerAddress ?? '',
        lastActivityGabon: data?.lastActivityGabon ?? ''
      },
      documents: {
        passportFile: undefined,
        birthCertificateFile: undefined,
        residencePermitFile: undefined,
        addressProofFile: undefined
      }
    }
  })

  async function onSubmit(formData: ProfileDataInput) {
    try {
      setError(undefined)
      startTransition(async () => {
        // Préparer les fichiers
        const files = {
          passport: formData.documents?.passportFile ?
            createFormDataFromFile(formData.documents.passportFile) : undefined,
          birthCertificate: formData.documents?.birthCertificateFile ?
            createFormDataFromFile(formData.documents.birthCertificateFile) : undefined,
          residencePermit: formData.documents?.residencePermitFile ?
            createFormDataFromFile(formData.documents.residencePermitFile) : undefined,
          addressProof: formData.documents?.addressProofFile ?
            createFormDataFromFile(formData.documents.addressProofFile) : undefined,
          identityPicture: formData.basicInfo?.identityPictureFile ?
            createFormDataFromFile(formData.basicInfo.identityPictureFile) : undefined,
        }

        if (data) {
          // Mise à jour d'un profil existant
          await updateProfile(data.id, formData, files)
          setSuccess(t('messages.profile_updated'))
          router.refresh()
        } else {
          // Création d'un nouveau profil
          await postProfile(formData, files)
          setSuccess(t('messages.profile_created'))
          router.push(PAGE_ROUTES.my_profile as Route)
        }
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  // Fonction utilitaire pour créer un FormData à partir d'un fichier
  const createFormDataFromFile = (file: File | FileList) => {
    const formData = new FormData()
    if (file instanceof FileList) {
      formData.append('files', file[0])
    } else {
      formData.append('files', file)
    }
    return formData
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">
        {data ? t('edit_profile') : t('create_profile')}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Type de demande */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {t('sections.request_type')}
              </h2>
            </CardHeader>
            <CardContent>
              <SectionRequestType form={form} />
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {t('sections.documents')}
              </h2>
            </CardHeader>
            <CardContent>
              <SectionDocuments form={form} existingData={data} />
            </CardContent>
          </Card>

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {t('sections.basic_info')}
              </h2>
            </CardHeader>
            <CardContent>
              <SectionBasicInfo form={form} />
            </CardContent>
          </Card>

          {/* Informations familiales */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {t('sections.family_info')}
              </h2>
            </CardHeader>
            <CardContent>
              <SectionFamilyInfo form={form} />
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {t('sections.contact_info')}
              </h2>
            </CardHeader>
            <CardContent>
              <SectionContactInfo form={form} />
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {t('sections.professional_info')}
              </h2>
            </CardHeader>
            <CardContent>
              <SectionProfessionalInfo form={form} />
            </CardContent>
          </Card>

          {/* Messages d'erreur et de succès */}
          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}

          {/* Bouton de soumission */}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
            {data ? t('actions.save') : t('actions.create')}
          </Button>
        </form>
      </Form>
    </div>
  )
}