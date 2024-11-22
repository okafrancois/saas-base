'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { cn, DocumentField } from '@/lib/utils'
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
import { getFieldsForDocument } from '@/lib/document-fields'
import { analyzeDocuments } from '@/actions/documents'
import { FamilyInfoForm } from '@/components/registration/family-info'
import { ContactInfoForm } from '@/components/registration/contact-form'
import { ProfessionalInfoForm } from '@/components/registration/professional-info'
import { ReviewForm } from '@/components/registration/review'
import { Gender, MaritalStatus, NationalityAcquisition, WorkStatus } from '@prisma/client'
import { postProfile } from '@/actions/profile'

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
    defaultValues: {
      passportFile: null,
      birthCertificateFile: null,
      residencePermitFile: null,
      addressProofFile: null,
    },
    reValidateMode: 'onChange'
  })

  const basicInfoForm = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: Gender.MALE,
      birthDate: '',
      birthPlace: '',
      birthCountry: '',
      nationality: '',
      acquisitionMode: NationalityAcquisition.BIRTH,
      identityPictureFile: null,
    }
  })

  const familyInfoForm = useForm<FamilyInfoFormData>({
    resolver: zodResolver(FamilyInfoSchema),
    defaultValues: {
      maritalStatus: MaritalStatus.SINGLE,
      fatherFullName: '',
      motherFullName: '',
      spouseFullName: '',
      emergencyContact: {
        fullName: '',
        relationship: '',
        phone: '',
      }
    }
  })

  const contactInfoForm = useForm<ContactInfoFormData>({
    resolver: zodResolver(ContactInfoSchema),
    defaultValues: {
      email: '',
      phone: '',
      address: {
        firstLine: '',
        secondLine: '',
        city: '',
        zipCode: '',
        country: '',
      },
      addressInGabon: {
        address: '',
        district: '',
        city: '',
      }
    }
  })

  const professionalInfoForm = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(ProfessionalInfoSchema),
    defaultValues: {
      workStatus: WorkStatus.UNEMPLOYED,
      profession: '',
      employer: '',
      employerAddress: '',
      lastActivityGabon: '',
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

  const handleDocumentsAnalysis = async () => {
    const analysisFormData = new FormData()
    const analysisFields: {key: keyof DocumentsFormData, fields: DocumentField[]}[] = []

    // Collecter les documents et leurs champs respectifs
    Object.entries(documentsForm.getValues()).forEach(([key, fileList]) => {
      if (fileList) {
        const documentFields = getFieldsForDocument(key as keyof DocumentsFormData)
        analysisFields.push({
          key: key as keyof DocumentsFormData,
          fields: documentFields
        })
        analysisFormData.append(key, fileList)
      }
    })

    if (analysisFields.length === 0) {
      toast({
        title: t('documents.analysis.error.title'),
        description: t('documents.analysis.error.no_document'),
        variant: "destructive"
      })
      setError(t('documents.analysis.error.no_document'))
      return
    }

    setIsLoading(true)
    setError(undefined)

    try {
      const results = await analyzeDocuments(analysisFormData, analysisFields, 'gpt')

      if (results.success && results.mergedData) {
        // Pré-remplir les formulaires avec les données extraites
        const { mergedData } = results

        // Informations de base
        if (mergedData) {
          basicInfoForm.reset({
            ...basicInfoForm.getValues(),
            firstName: mergedData.firstName,
            lastName: mergedData.lastName,
            gender: mergedData.gender,
            birthDate: mergedData.birthDate,
            birthPlace: mergedData.birthPlace,
            birthCountry: mergedData.birthCountry,
            nationality: mergedData.nationality,
            acquisitionMode: mergedData.acquisitionMode,
            passportNumber: mergedData.passportNumber,
            passportIssueDate: mergedData.passportIssueDate,
            passportExpiryDate: mergedData.passportExpiryDate,
            passportIssueAuthority: mergedData.passportIssueAuthority,
          })

          // Informations de contact
          if (mergedData.address) {
            contactInfoForm.reset({
              ...contactInfoForm.getValues(),
              address: {
                firstLine: mergedData.address.firstLine,
                secondLine: mergedData.address.secondLine || '',
                city: mergedData.address.city,
                zipCode: mergedData.address.zipCode || '',
                country: mergedData.address.country,
              }
            })
          }

          // Informations familiales
          familyInfoForm.reset({
            ...familyInfoForm.getValues(),
            maritalStatus: mergedData.maritalStatus,
            fatherFullName: mergedData.fatherFullName,
            motherFullName: mergedData.motherFullName,
          })

          // Informations professionnelles
          if (mergedData.workStatus || mergedData.profession || mergedData.employer) {
            professionalInfoForm.reset({
              ...professionalInfoForm.getValues(),
              workStatus: mergedData.workStatus,
              profession: mergedData.profession,
              employer: mergedData.employer,
              employerAddress: mergedData.employerAddress,
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
            )
          })
        }
      } else {
        throw new Error(results.error || t('documents.analysis.error.unknown'))
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
            handleAnalysis={handleDocumentsAnalysis}
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