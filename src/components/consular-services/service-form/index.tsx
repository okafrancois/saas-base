'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ConsularService, ServiceStep, UserDocument } from '@prisma/client'
import { StepForm } from './step-form'
import { DocumentsStep } from './documents-step'
import { ReviewStep } from './review-step'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react'
import { StepIndicator } from './step-indicator'
import { FullProfile } from '@/types'

interface ServiceFormProps {
  service: ConsularService & { steps: ServiceStep[] }
  profile: FullProfile | null
  documents: UserDocument[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: Record<keyof FullProfile, any>
  isLoading?: boolean
}

export function ServiceForm({
                              service,
                              profile,
                              documents,
                              defaultValues,
                              isLoading
                            }: ServiceFormProps) {
  const t = useTranslations('consular.services.form')
  const [currentStep, setCurrentStep] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>(defaultValues || {})

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSubmit(data: Record<string, any>) {
    console.log(data)
  }

  // Filtrer les documents déjà fournis et ceux à fournir
  const existingDocuments = service.requiredDocuments.filter(
    doc => documents?.some(d => d.type === doc)
  )

  const documentsToProvide = service.requiredDocuments.filter(
    doc => !existingDocuments.includes(doc)
  )

  // Gérer la soumission d'une étape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStepSubmit = (stepData: Record<string, any>) => {
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      ...stepData
    }))

    if (currentStep < service.steps.length + 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onSubmit(formData)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  // Rendu de l'étape courante
  const renderStep = () => {
    // Première étape : Documents
    if (currentStep === 0) {
      return (
        <DocumentsStep
          existingDocuments={existingDocuments}
          requiredDocuments={documentsToProvide}
          optionalDocuments={service.optionalDocuments}
          onSubmit={handleStepSubmit}
          defaultValues={formData.documents}
        />
      )
    }

    // Dernière étape : Revue
    if (currentStep === service.steps.length + 1) {
      return (
        <ReviewStep
          service={service}
          data={formData}
          onSubmit={handleStepSubmit}
        />
      )
    }

    // Étapes dynamiques du service
    const step = service.steps[currentStep - 1]
    return (
      <StepForm
        step={step}
        profile={profile}
        onSubmit={handleStepSubmit}
      />
    )
  }

  return (
    <div className="space-y-6">
      <StepIndicator
        currentStep={currentStep}
        totalSteps={service.steps.length + 2}
        steps={[
          {
            title: t('steps.documents'),
            description: t('steps.documents_description')
          },
          ...service.steps.map(step => ({
            title: step.title,
            description: step.description || ''
          })),
          {
            title: t('steps.review'),
            description: t('steps.review_description')
          }
        ]}
      />

      <Card className="p-6">
        {renderStep()}
      </Card>

      <div className="flex justify-between">
        {currentStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('navigation.previous')}
          </Button>
        )}

        <Button
          onClick={() => handleStepSubmit(formData)}
          disabled={isLoading}
          className="ml-auto"
        >
          {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          {currentStep === service.steps.length + 1
            ? t('navigation.submit')
            : t('navigation.next')
          }
          {!isLoading && currentStep < service.steps.length + 1 && (
            <ArrowRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}