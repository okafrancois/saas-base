'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Procedure, ProcedureStep } from '@prisma/client'
import { StepIndicator } from './step-indicator'
import { StepForm } from './step-form'
import { DocumentsStep } from './documents-step'
import { ReviewStep } from './review-step'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react'

interface ProcedureFormProps {
  procedure: Procedure & {
    steps: ProcedureStep[]
  }
  onSubmit: (data: any) => Promise<void>
  defaultValues?: any
  isLoading?: boolean
}

export function ProcedureForm({
                                procedure,
                                onSubmit,
                                defaultValues,
                                isLoading
                              }: ProcedureFormProps) {
  const t = useTranslations('procedures.form')
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(defaultValues || {})

  const handleStepSubmit = (stepData: any) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }))

    if (currentStep < procedure.steps.length + 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onSubmit(formData)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const renderStep = () => {
    // Documents step
    if (currentStep === 0) {
      return (
        <DocumentsStep
          requiredDocuments={procedure.requiredDocuments}
          optionalDocuments={procedure.optionalDocuments}
          onSubmit={handleStepSubmit}
          defaultValues={formData.documents}
        />
      )
    }

    // Review step
    if (currentStep === procedure.steps.length + 1) {
      return (
        <ReviewStep
          procedure={procedure}
          data={formData}
          onSubmit={handleStepSubmit}
        />
      )
    }

    // Dynamic steps from procedure
    const step = procedure.steps[currentStep - 1]
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
        totalSteps={procedure.steps.length + 2}
        steps={[
          { title: t('steps.documents'), description: t('steps.documents_description') },
          ...procedure.steps.map(step => ({
            title: step.title,
            description: step.description || ''
          })),
          { title: t('steps.review'), description: t('steps.review_description') }
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
          {currentStep === procedure.steps.length + 1
            ? t('navigation.submit')
            : t('navigation.next')
          }
          {!isLoading && currentStep < procedure.steps.length + 1 && (
            <ArrowRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}