'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { cn, useFormStorage } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { FormError } from '@/components/form-error'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { BasicInfoForm } from './basic-info'
import { FamilyInfoForm } from './family-info'
import { ContactInfoForm } from './contact-form'
import { ProfessionalInfoForm } from './professional-info'
import { ReviewForm } from './review'
import { PAGE_ROUTES } from '@/schemas/app-routes'
// import { postProfile } from '@/actions/profile'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BasicInfoFormData,
  ContactInfoFormData,
  DocumentsFormData,
  FamilyInfoFormData, ProfessionalInfoFormData,
} from '@/schemas/registration'
import { DocumentsUploadForm } from '@/app/(public)/registration/_components/documents'
import { AnalysisData } from '@/types'
import { Gender, WorkStatus } from '@prisma/client'

// Types et configurations
type StepKey = 'request_type' | 'documents' | 'identity' | 'family' | 'contact' | 'professional' | 'review'

const STEPS: StepKey[] = [
  'request_type',
  'documents',
  'identity',
  'family',
  'contact',
  'professional',
  'review',
]

export type ConsularFormData = {
  documents?: DocumentsFormData
  basicInfo?: BasicInfoFormData
  familyInfo?: FamilyInfoFormData
  contactInfo?: ContactInfoFormData
  professionalInfo?: ProfessionalInfoFormData
}

export default function RegistrationForm() {
  const router = useRouter()

  const t = useTranslations('consular_registration')
  const { loadSavedData, saveData, clearData } = useFormStorage()

  // État local
  const [formData, setFormData] = useState<ConsularFormData>(() => loadSavedData() || {})
  const [error, setError] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Référence pour le formulaire actuel
  const currentFormRef = useRef<HTMLFormElement>(null)
  const progress = ((currentStep + 1) / STEPS.length) * 100

  // Gestion des soumissions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStepSubmit = async (data: any) => {
    const stepKey = STEPS[currentStep]
    try {
      const newFormData = { ...formData }
      switch (stepKey) {
        case 'documents':
          newFormData.documents = data
          break
        case 'identity':
          newFormData.basicInfo = data
          break
        case 'family':
          newFormData.familyInfo = data
          break
        case 'contact':
          newFormData.contactInfo = data
          break
        case 'professional':
          newFormData.professionalInfo = data
          break
        case 'review':
          await handleFinalSubmit()
          return
      }

      setFormData(newFormData)
      saveData(newFormData) // Sauvegarder dans le sessionStorage
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
      return true
    } catch (error) {
      console.error('Error submitting form:', error)
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
      return false
    }
  }

  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const profileData = {
        basicInfo:{
          ...formData.basicInfo,
          identityPictureFile: undefined,
        } as BasicInfoFormData,
        familyInfo: formData.familyInfo as FamilyInfoFormData,
        contactInfo: formData.contactInfo as ContactInfoFormData,
        professionalInfo: formData.professionalInfo as ProfessionalInfoFormData,
      };

      // Create FormData objects for each file
      const files = {
        passport: formData.documents?.passportFile ? createFormDataFromFile(formData.documents.passportFile) : undefined,
        birthCertificate: formData.documents?.birthCertificateFile ? createFormDataFromFile(formData.documents.birthCertificateFile) : undefined,
        residencePermit: formData.documents?.residencePermitFile ? createFormDataFromFile(formData.documents.residencePermitFile) : undefined,
        addressProof: formData.documents?.addressProofFile ? createFormDataFromFile(formData.documents.addressProofFile) : undefined,
        identityPicture: formData.basicInfo?.identityPictureFile ? createFormDataFromFile(formData.basicInfo.identityPictureFile) : undefined,
      };

      // const result = await postProfile(profileData, files);
      const result = { success: true };

      if (result) {
        // Clear stored data
        clearData();
        // Redirect on success
        router.push(PAGE_ROUTES.dashboard);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

// Helper function to create FormData from a file
  const createFormDataFromFile = (file: File | FileList) => {
    const formData = new FormData();
    if (file instanceof FileList) {
      formData.append('files', file[0]);
    } else {
      formData.append('files', file);
    }
    return formData;
  };

  // Navigation entre les étapes
  const handleStepChange = (step: number) => {
    if (step <= Math.max(currentStep, 0)) {
      setCurrentStep(step)
    }
  }

  // Gestion de l'analyse des documents
  const handleAnalysisComplete = (data: AnalysisData) => {
    const newFormData = { ...formData };

    // Mise à jour des données de base
    if (data.firstName || data.lastName || data.gender || data.birthDate ||
      data.birthPlace || data.birthCountry || data.nationality ||  data.passportNumber || data.passportIssueDate || data.passportExpiryDate || data.passportExpiryDate) {
      newFormData.basicInfo = {
        ...newFormData.basicInfo,
        firstName: data.firstName ?? newFormData.basicInfo?.firstName ?? '',
        lastName: data.lastName ?? newFormData.basicInfo?.lastName ?? '',
        gender: data.gender ?? newFormData.basicInfo?.gender ?? Gender.MALE,
        birthDate: data.birthDate ?? newFormData.basicInfo?.birthDate ?? '',
        birthPlace: data.birthPlace ?? newFormData.basicInfo?.birthPlace ?? '',
        birthCountry: data.birthCountry?.toLowerCase() ?? newFormData.basicInfo?.birthCountry ?? '',
        nationality: data.nationality?.toLowerCase() ?? newFormData.basicInfo?.nationality ?? '',
        passportNumber: data.passportNumber ?? newFormData.basicInfo?.passportNumber ?? '',
        passportIssueDate: data.passportIssueDate ?? newFormData.basicInfo?.passportIssueDate,
        passportExpiryDate: data.passportExpiryDate ?? newFormData.basicInfo?.passportExpiryDate,
        passportIssueAuthority: data.passportExpiryDate ?? newFormData.basicInfo?.passportIssueAuthority,
      };
    }

    // Mise à jour des données d'adresse
    if (data.address) {
      newFormData.contactInfo = {
        ...newFormData.contactInfo,
        address: {
          firstLine: data.address?.firstLine ?? newFormData.contactInfo?.address?.firstLine ?? '',
          secondLine: data.address?.secondLine ?? newFormData.contactInfo?.address?.secondLine ?? '',
          city: data.address?.city ?? newFormData.contactInfo?.address?.city ?? '',
          zipCode: data.address?.zipCode ?? newFormData.contactInfo?.address?.zipCode ?? '',
          country: data.address?.country.toLowerCase() ?? newFormData.contactInfo?.address?.country ?? '',
        }
      };
    }

    // Mise à jour des données professionnelles
    if (data.workStatus ?? data.profession ?? data.employer ?? data.employerAddress) {
      newFormData.professionalInfo = {
        ...newFormData.professionalInfo,
        workStatus: data.workStatus ?? newFormData.professionalInfo?.workStatus ?? WorkStatus.UNEMPLOYED,
        profession: data.profession ?? newFormData.professionalInfo?.profession ?? '',
        employer: data.employer ?? newFormData.professionalInfo?.employer ?? '',
        employerAddress: data.employerAddress ?? newFormData.professionalInfo?.employerAddress ?? '',
      };
    }

    // Mise à jour des données familiales
    if (data.maritalStatus ?? data.fatherFullName ?? data.motherFullName) {
      newFormData.familyInfo = {
        ...newFormData.familyInfo,
        maritalStatus: data.maritalStatus ?? newFormData.familyInfo?.maritalStatus ?? 'SINGLE',
        fatherFullName: data.fatherFullName ?? newFormData.familyInfo?.fatherFullName ?? '',
        motherFullName: data.motherFullName ?? newFormData.familyInfo?.motherFullName ?? '',
      };
    }

    setFormData(newFormData);
    saveData(newFormData);
  };

  const goToNextStep = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      if (currentStep === STEPS.length - 1) {
        await handleFinalSubmit()
        return
      }

      currentFormRef.current?.requestSubmit()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
    setError(undefined)
  }

  // Rendu du contenu de l'étape actuelle
  const renderStepContent = () => {
    const stepKey = STEPS[currentStep]
    switch (stepKey) {
      case 'documents':
        return (
          <DocumentsUploadForm
            onSubmit={handleStepSubmit}
            defaultValues={formData.documents}
            formRef={currentFormRef}
            isLoading={isLoading}
            onDocumentsAnalysisComplete={handleAnalysisComplete}
            nextStep={goToNextStep}
          />
        )
      case 'identity':
        return (
          <BasicInfoForm
            onSubmit={handleStepSubmit}
            defaultValues={formData.basicInfo}
            formRef={currentFormRef}
            isLoading={isLoading}
          />
        )
      case 'family':
        return (
          <FamilyInfoForm
            onSubmit={handleStepSubmit}
            defaultValues={formData.familyInfo}
            formRef={currentFormRef}
            isLoading={isLoading}
          />
        )
      case 'contact':
        return (
          <ContactInfoForm
            onSubmit={handleStepSubmit}
            defaultValues={formData.contactInfo}
            formRef={currentFormRef}
            isLoading={isLoading}
          />
        )
      case 'professional':
        return (
          <ProfessionalInfoForm
            onSubmit={handleStepSubmit}
            defaultValues={formData.professionalInfo}
            formRef={currentFormRef}
            isLoading={isLoading}
          />
        )
      case 'review':
        return <ReviewForm data={formData} />
      default:
        return null
    }
  }

  useEffect(() => {
   return () => {
      clearData()
   }
  })

  return (
    <div className="mx-auto max-w-5xl">
      {/* En-tête et barre de progression */}
      <div className="mb-8 space-y-4">
        <h1 className="text-center text-2xl font-bold md:text-3xl">
          {t('header.title')}
        </h1>
        <p className="text-center text-muted-foreground">
          {t('header.subtitle')}
        </p>

        {/* Progress bar et étapes */}
        <div className="mb-2 h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Navigation des étapes cliquables */}
        <Tabs value={STEPS[currentStep]} className="w-full">
          <TabsList className="grid w-full h-auto grid-cols-2 gap-2 rounded-lg bg-muted p-1 md:grid-cols-7">
            {STEPS.map((step, index) => (
              <TabsTrigger
                key={step}
                value={step}
                disabled={index > currentStep}
                onClick={() => handleStepChange(index)}
                className={cn(
                  'flex-1 px-3 py-1.5 text-sm font-medium transition-all',
                  'data-[state=active]:bg-white data-[state=active]:text-primary',
                  'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
                  index <= currentStep ? 'hover:text-primary cursor-pointer' : '',
                  'hidden md:block', // Masquer sur mobile sauf l'étape actuelle
                  index === currentStep || index === currentStep + 1 ? '!block' : '' // Toujours afficher l'étape actuelle
                )}
              >
                {t(`steps.${step}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Contenu principal */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {renderStepContent()}

          {/* Barre de navigation */}
          <div className="mt-6 flex justify-between gap-4">
            {currentStep > 0 && (
              <Button
                onClick={goToPreviousStep}
                variant="outline"
                disabled={isLoading || isSubmitting}
                className="w-1/2 md:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('navigation.previous')}
              </Button>
            )}

            <Button
              onClick={goToNextStep}
              disabled={isLoading || isSubmitting}
              className={cn(
                'w-1/2 md:w-auto',
                currentStep === 0 && 'w-full'
              )}
            >
              {(isLoading || isSubmitting) && (
                <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {currentStep === STEPS.length - 1 ? t('validation.submit') : t('navigation.next')}
              {currentStep !== STEPS.length - 1 && (
                <ArrowRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages d'aide et d'erreur */}
      {error && <FormError message={error} />}
      <div className="mt-4 rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          {t(`help.${STEPS[currentStep]}`)}
        </p>
      </div>
    </div>
  )
}