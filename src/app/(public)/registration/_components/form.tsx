'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { cn, DocumentField } from '@/lib/utils'
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
  BasicInfoFormData, BasicInfoSchema,
  ContactInfoFormData,
  DocumentsFormData, DocumentsSchema,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration'
import { AnalysisData } from '@/types'
import { MobileProgress } from '@/app/(public)/registration/_components/mobile-progress'
import { StepGuide } from '@/app/(public)/registration/_components/step-guide'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getFieldsForDocument } from '@/lib/document-fields'
import { analyzeDocuments } from '@/actions/documents'

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

  const documentsForm = useForm<DocumentsFormData>({
    resolver: zodResolver(DocumentsSchema),
    defaultValues: {
      passportFile: null,
      birthCertificateFile: null,
      residencePermitFile: null,
      addressProofFile: null,
    }
  })

  const basicInfoForm = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
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
    console.log('Analysis complete', data)
  }

  const handleDocumentsAnalysis = async () => {
    console.log('Analyzing documents...', documentsForm.getValues())

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

      handleAnalysisComplete(results.mergedData)

      if (results.success && results.mergedData) {
        toast({
          title: t('documents.analysis.success.title'),
          description: t('documents.analysis.success.description'),
          variant: "success"
        })
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

  const handleDocumentSubmit = (data: DocumentsFormData) => {
    console.log('Documents submitted', data)
    setFormData(prev => ({
      ...prev,
      documents: data
    }))
    setCurrentStep(prev => prev + 1)
  }

  // Rendu du contenu de l'étape actuelle
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DocumentUploadSection
            form={documentsForm}
            handleAnalysis={handleDocumentsAnalysis}
            handleSubmit={handleDocumentSubmit}
            isLoading={isLoading}
          />
        )
      // ... autres étapes
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