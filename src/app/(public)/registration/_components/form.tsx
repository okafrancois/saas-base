'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { FormError } from '@/components/form-error'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { StepIndicator } from './step-indicator'
import { DocumentUploadSection } from './document-upload-section'
import { BasicInfoForm } from './basic-info'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { useToast } from '@/hooks/use-toast'
import {
  BasicInfoFormData,
  ContactInfoFormData,
  DocumentsFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData
} from '@/schemas/registration'
import { AnalysisData } from '@/types'
import { MobileProgress } from '@/app/(public)/registration/_components/mobile-progress'
import { StepGuide } from '@/app/(public)/registration/_components/step-guide'

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
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [formData, setFormData] = useState<ConsularFormData>(() => {
    // Charger les données sauvegardées si elles existent
    const saved = sessionStorage.getItem('consularFormData')
    return saved ? JSON.parse(saved) : {}
  })

  // Référence pour le formulaire actuel
  const currentFormRef = useRef<HTMLFormElement>(null)

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

  // Gestion de l'analyse des documents
  const handleAnalysisComplete = (data: AnalysisData) => {
    // Mise à jour des données pré-remplies
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        firstName: data.firstName ?? prev.basicInfo?.firstName,
        lastName: data.lastName ?? prev.basicInfo?.lastName,
        // ... autres champs
      },
      // ... autres sections
    }))

    toast({
      title: t('analysis.success'),
      description: t('analysis.data_prefilled'),
      variant: "success"
    })
  }

  // Navigation entre les étapes
  const goToNextStep = async () => {
    if (isLoading) return

    try {
      setIsLoading(true)
      setError(undefined)

      if (currentStep === steps.length - 1) {
        await handleFinalSubmit()
        return
      }

      // Déclencher la soumission du formulaire actuel
      const form = currentFormRef.current
      if (form) {
        await form.requestSubmit()
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
      // Appel API pour soumettre le formulaire

      toast({
        title: t('submission.success.title'),
        description: t('submission.success.description'),
      })

      // Redirection vers le dashboard
      router.push(PAGE_ROUTES.dashboard)
    } catch (error) {
      setError(t('submission.error.unknown'))
    } finally {
      setIsLoading(false)
    }
  }

  // Rendu du contenu de l'étape actuelle
  const renderStepContent = () => {
    const currentStepKey = steps[currentStep].key

    switch (currentStepKey) {
      case 'documents':
        return (
          <DocumentUploadSection
            onAnalysisComplete={handleAnalysisComplete}
            defaultValues={formData.documents}
            formRef={currentFormRef}
          />
        )
      case 'identity':
        return (
          <BasicInfoForm
            onSubmit={(data) => {
              setFormData(prev => ({ ...prev, basicInfo: data }))
            }}
            defaultValues={formData.basicInfo}
            formRef={currentFormRef}
          />
        )
      // ... autres cas
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
          {renderStepContent()}

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
        stepKey={steps[currentStep].key}
        isOptional={steps[currentStep].isOptional}
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