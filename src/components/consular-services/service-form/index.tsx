'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ConsularService, UserDocument } from '@prisma/client'
import { DocumentsStep } from './documents-step'
import { StepIndicator } from './step-indicator'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react'

interface ServiceFormProps {
  service: ConsularService
  documents: UserDocument[]
}

export function ServiceForm({ service, documents }: ServiceFormProps) {
  const t = useTranslations('consular.services.form')
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Filtrer les documents déjà fournis et ceux à fournir
  const existingDocuments = service.requiredDocuments.filter(
    doc => documents?.some(d => d.type === doc)
  )

  const documentsToProvide = service.requiredDocuments.filter(
    doc => !existingDocuments.includes(doc)
  )

  const handleNext = async (stepData: any) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }))
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const steps = [
    {
      title: t('steps.documents'),
      description: t('steps.documents_description'),
      isComplete: false
    },
  ]

  return (
    <div className="space-y-6">
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onChange={setCurrentStep}
      />

      <Card className="p-6">
        {currentStep === 0 && (
          <DocumentsStep
            existingDocuments={existingDocuments}
            requiredDocuments={documentsToProvide}
            optionalDocuments={service.optionalDocuments}
            onSubmit={handleNext}
            isLoading={isLoading}
          />
        )}
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
          onClick={() => handleNext(formData)}
          disabled={isLoading}
          className="ml-auto"
        >
          {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          {currentStep === steps.length - 1
            ? t('navigation.submit')
            : t('navigation.next')
          }
          {!isLoading && currentStep < steps.length - 1 && (
            <ArrowRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}