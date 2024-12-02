'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ConsularService, ServiceStep } from '@prisma/client'
import { StepForm } from './step-form'
import { DocumentsStep } from './documents-step'
import { ReviewStep } from './review-step'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react'
import { StepIndicator } from '@/components/consular-services/service-form/step-indicator'

interface ServiceFormProps {
  service: ConsularService & { steps: ServiceStep[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: any
  isLoading?: boolean
}

export function ServiceForm({
                              service,
                              onSubmit,
                              defaultValues,
                              isLoading
                            }: ServiceFormProps) {
  const t = useTranslations('consular.services.form')
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(defaultValues || {})

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStepSubmit = (stepData: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({ ...prev, ...stepData }))
    if (currentStep < service.steps.length + 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onSubmit(formData)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <DocumentsStep
          requiredDocuments={service.requiredDocuments}
          optionalDocuments={service.optionalDocuments}
          onSubmit={handleStepSubmit}
          defaultValues={formData.documents}
        />
      )
    }

    if (currentStep === service.steps.length + 1) {
      return (
        <ReviewStep
          service={service}
          data={formData}
          onSubmit={handleStepSubmit}
        />
      )
    }

    const step = service.steps[currentStep - 1]
    return (
      <StepForm
        step={step}
        onSubmit={handleStepSubmit}
        defaultValues={formData[`step_${step.id}`]}
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
          <Button onClick={handleBack} variant="outline" disabled={isLoading}>
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