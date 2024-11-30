'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { FormError } from '@/components/ui/form-error'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { StepIndicator } from './step-indicator'
import { DocumentUploadSection } from './document-upload-section'
import { BasicInfoForm } from './basic-info'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { useToast } from '@/hooks/use-toast'
import {
  BasicInfoFormData, BasicInfoSchema,
  ContactInfoFormData, ContactInfoSchema,
  DocumentsFormData, DocumentsSchema,
  FamilyInfoFormData, FamilyInfoSchema,
  ProfessionalInfoFormData, ProfessionalInfoSchema,
} from '@/schemas/registration'
import { MobileProgress } from '@/components/registration/mobile-progress'
import { StepGuide } from '@/components/registration/step-guide'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FamilyInfoForm } from '@/components/registration/family-info'
import { ContactInfoForm } from '@/components/registration/contact-form'
import { ProfessionalInfoForm } from '@/components/registration/professional-info'
import { ReviewForm } from '@/components/registration/review'
import { Gender, MaritalStatus, NationalityAcquisition, WorkStatus } from '@prisma/client'
import { postProfile } from '@/actions/profile'
import { AnalysisData } from '@/types'

type StepKey = 'documents' | 'identity' | 'family' | 'contact' | 'professional' | 'review'

interface Step {
  key: StepKey
  title: string
  description: string
  isComplete: boolean
  isOptional?: boolean
}

export type ConsularFormData = {
  documents?: DocumentsFormData
  basicInfo?: BasicInfoFormData
  familyInfo?: FamilyInfoFormData
  contactInfo?: ContactInfoFormData
  professionalInfo?: ProfessionalInfoFormData
}

export function RegistrationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('registration')

  // État local
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [formData, setFormData] = useState<ConsularFormData>(() => {
    // Charger les données sauvegardées si elles existent
    const saved = sessionStorage.getItem('consularFormData')
    return saved ? JSON.parse(saved) : {}
  })
  const [currentStep, setCurrentStep] = useState<number>(0)
  const currentFormRef = useRef<HTMLFormElement>(null)

  const documentsForm = useForm<DocumentsFormData>({
    resolver: zodResolver(DocumentsSchema),
  })

  const basicInfoForm = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: {
      gender: Gender.MALE,
      acquisitionMode: NationalityAcquisition.BIRTH,
    }
  })

  const familyInfoForm = useForm<FamilyInfoFormData>({
    resolver: zodResolver(FamilyInfoSchema),
    defaultValues: {
      maritalStatus: MaritalStatus.SINGLE
    }
  })

  const contactInfoForm = useForm<ContactInfoFormData>({
    resolver: zodResolver(ContactInfoSchema),
  })

  const professionalInfoForm = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(ProfessionalInfoSchema),
    defaultValues: {
      workStatus: WorkStatus.UNEMPLOYED,
    }
  })


  // Configuration des étapes
  const steps: Step[] = [
    {
      key: 'documents',
      title: t('steps.documents'),
      description: t('steps.documents_description'),
      isComplete: !!formData.documents
    },
    {
      key: 'identity',
      title: t('steps.identity'),
      description: t('steps.identity_description'),
      isComplete: !!formData.basicInfo
    },
    {
      key: 'family',
      title: t('steps.family'),
      description: t('steps.family_description'),
      isComplete: !!formData.familyInfo
    },
    {
      key: 'contact',
      title: t('steps.contact'),
      description: t('steps.contact_description'),
      isComplete: !!formData.contactInfo
    },
    {
      key: 'professional',
      title: t('steps.professional'),
      description: t('steps.professional_description'),
      isComplete: !!formData.professionalInfo,
      isOptional: true
    },
    {
      key: 'review',
      title: t('steps.review'),
      description: t('steps.review_description'),
      isComplete: false
    }
  ]

  // Sauvegarder les données du formulaire
  useEffect(() => {
    sessionStorage.setItem('consularFormData', JSON.stringify(formData))
  }, [formData])

  const handleDocumentsAnalysis = async (data: AnalysisData) => {
    setIsLoading(true)
    setError(undefined)

    try {
      if (data) {
        basicInfoForm.reset({
          ...basicInfoForm.getValues(),
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          birthDate: data.birthDate,
          birthPlace: data.birthPlace,
          birthCountry: data.birthCountry,
          nationality: data.nationality,
          acquisitionMode: data.acquisitionMode,
          passportNumber: data.passportNumber,
          passportIssueDate: data.passportIssueDate,
          passportExpiryDate: data.passportExpiryDate,
          passportIssueAuthority: data.passportIssueAuthority,
        })

        // Informations de contact
        if (data.address) {
          contactInfoForm.reset({
            ...contactInfoForm.getValues(),
            address: {
              firstLine: data.address.firstLine,
              secondLine: data.address.secondLine || '',
              city: data.address.city,
              zipCode: data.address.zipCode || '',
              country: data.address.country,
            }
          })
        }

        // Informations familiales
        familyInfoForm.reset({
          ...familyInfoForm.getValues(),
          maritalStatus: data.maritalStatus,
          fatherFullName: data.fatherFullName,
          motherFullName: data.motherFullName,
        })

        // Informations professionnelles
        if (data.workStatus || data.profession || data.employer) {
          professionalInfoForm.reset({
            ...professionalInfoForm.getValues(),
            workStatus: data.workStatus,
            profession: data.profession,
            employer: data.employer,
            employerAddress: data.employerAddress,
          })
        }

        // Mettre à jour le state global
        setFormData(prev => ({
          ...prev,
          basicInfo: basicInfoForm.getValues(),
          contactInfo: contactInfoForm.getValues(),
          familyInfo: familyInfoForm.getValues(),
          professionalInfo: professionalInfoForm.getValues(),
        }))

        toast({
          title: t('documents.analysis.success.title'),
          description: t('documents.analysis.success.description'),
          variant: "success",
          action: (
            <Button onClick={() => setCurrentStep(prev => prev + 1)} size="sm">
              {t('documents.analysis.success.action')}
            </Button>
          ),
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t('errors.unknown'))
      toast({
        title: t('documents.analysis.error.title'),
        description: error instanceof Error ? error.message : t('errors.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour vérifier la validité du formulaire actuel
  const validateCurrentStep = async () => {
    try {
      let isValid = false

      switch (currentStep) {
        case 0:
          isValid = await documentsForm.trigger()
          if (isValid) {
            const data = documentsForm.getValues()
            setFormData(prev => ({ ...prev, documents: data }))
          }
          break

        case 1:
          isValid = await basicInfoForm.trigger()
          if (isValid) {
            const data = basicInfoForm.getValues()
            setFormData(prev => ({ ...prev, basicInfo: data }))
          }
          break

        case 2:
          isValid = await familyInfoForm.trigger()
          if (isValid) {
            const data = familyInfoForm.getValues()
            setFormData(prev => ({ ...prev, familyInfo: data }))
          }
          break

        case 3:
          isValid = await contactInfoForm.trigger()
          if (isValid) {
            const data = contactInfoForm.getValues()
            setFormData(prev => ({ ...prev, contactInfo: data }))
          }
          break

        case 4:
          // Étape optionnelle
          isValid = steps[currentStep].isOptional || await professionalInfoForm.trigger()
          if (isValid) {
            const data = professionalInfoForm.getValues()
            setFormData(prev => ({ ...prev, professionalInfo: data }))
          }
          break

        case 5:
          // Étape de révision
          isValid = true
          break

        default:
          isValid = false
      }

      return isValid
    } catch (error) {
      console.error('Validation error:', error)
      return false
    }
  }

  // Navigation entre les étapes
  const goToNextStep = async () => {
    if (isLoading) return

    try {
      setIsLoading(true)
      setError(undefined)

      // Valider l'étape actuelle
      const isValid = await validateCurrentStep()

      if (!isValid) {
        toast({
          title: t('validation.error.title'),
          description: t('validation.error.description'),
          variant: "destructive"
        })
        return
      }

      if (currentStep === steps.length - 1) {
        await handleFinalSubmit()
        return
      }

      setCurrentStep(prev => prev + 1)
    } catch (error) {
      setError(error instanceof Error ? error.message : t('errors.unknown'))
    } finally {
      setIsLoading(false)
    }
  }

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
    setError(undefined)
  }

  // Soumission finale
  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true)

      const formDataToSend = new FormData()

      // Ajouter les fichiers
      if (formData.documents) {
        Object.entries(formData.documents).forEach(([key, file]) => {
          if (file) formDataToSend.append(key, file)
        })
      }

      // Ajouter les données JSON
      formDataToSend.append('basicInfo', JSON.stringify(formData.basicInfo))
      formDataToSend.append('contactInfo', JSON.stringify(formData.contactInfo))
      formDataToSend.append('familyInfo', JSON.stringify(formData.familyInfo))
      formDataToSend.append('professionalInfo', JSON.stringify(formData.professionalInfo))

      const result = await postProfile(formDataToSend)

      if (result.error) {
        toast({
          title: t('submission.error.title'),
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: t('submission.success.title'),
        description: t('submission.success.description'),
      })

      // Redirection vers le dashboard
      router.push(PAGE_ROUTES.dashboard)

    } catch (error) {
      toast({
        title: t('submission.error.title'),
        description: t('errors.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DocumentUploadSection
            form={documentsForm}
            onAnalysisComplete={handleDocumentsAnalysis}
            handleSubmit={() => {
              goToNextStep()
            }}
            isLoading={isLoading}
            formRef={currentFormRef}
          />
        )

      case 1:
        return (
          <BasicInfoForm
            form={basicInfoForm}
            onSubmit={() => {
              console.log('Basic info form submitted')
              goToNextStep()
            }}
            formRef={currentFormRef}
            isLoading={isLoading}
          />
        )

      case 2:
        return (
          <FamilyInfoForm
            form={familyInfoForm}
            onSubmit={() => {
              goToNextStep()
            }}
            formRef={currentFormRef}
            isLoading={isLoading}
          />
        )

      case 3:
        return (
          <ContactInfoForm
            form={contactInfoForm}
            onSubmit={() => {
              goToNextStep()
            }}
            formRef={currentFormRef}
            isLoading={isLoading}
          />
        )

      case 4:
        return (
          <ProfessionalInfoForm
            form={professionalInfoForm}
            onSubmit={() => {
              goToNextStep()
            }}
            formRef={currentFormRef}
            isLoading={isLoading}
          />
        )

      case 5:
        return (
          <ReviewForm
            data={formData}
            onSubmit={handleFinalSubmit}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* En-tête avec progression */}
      <div className="mb-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold md:text-3xl">
            {t('header.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('header.subtitle')}
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onChange={setCurrentStep}
        />
      </div>

      {/* Contenu principal */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {renderCurrentStep()}

          {/* Navigation */}
          <div className="mt-8 flex justify-between gap-4">
            {currentStep > 0 && (
              <Button
                onClick={goToPreviousStep}
                variant="outline"
                disabled={isLoading}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('navigation.previous')}
              </Button>
            )}

            <Button
              onClick={goToNextStep}
              disabled={isLoading}
              className={cn(
                "gap-2",
                currentStep === 0 && "ml-auto"
              )}
            >
              {isLoading && (
                <Icons.Spinner className="h-4 w-4 animate-spin" />
              )}
              {currentStep === steps.length - 1
                ? t('navigation.submit')
                : t('navigation.next')
              }
              {currentStep !== steps.length - 1 && (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guide de l'étape */}
      <StepGuide
        stepKey={steps[currentStep]?.key}
        isOptional={steps[currentStep]?.isOptional}
      />

      {/* Progression mobile */}
      <MobileProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        stepTitle={steps[currentStep].title}
        isOptional={steps[currentStep].isOptional}
      />

      {/* Messages d'erreur */}
      {error && <FormError message={error} />}
    </div>
  )
}