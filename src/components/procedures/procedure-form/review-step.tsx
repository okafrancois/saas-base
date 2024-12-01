'use client'

import { useTranslations } from 'next-intl'
import { Procedure, ProcedureStep } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface ReviewStepProps {
  procedure: Procedure & {
    steps: ProcedureStep[]
  }
  data: any
  onSubmit: (data: any) => void
}

export function ReviewStep({ procedure, data, onSubmit }: ReviewStepProps) {
  const t = useTranslations('procedures.form')

  const renderDocumentStatus = (type: string) => {
    const document = data.documents?.[type]
    const isRequired = procedure.requiredDocuments.includes(type)

    return (
      <div className="flex items-center justify-between">
        <span>{t(`documents.types.${type.toLowerCase()}`)}</span>
        <Badge variant={document ? "success" : isRequired ? "destructive" : "secondary"}>
          {document
            ? t('documents.status.uploaded')
            : isRequired
              ? t('documents.status.missing')
              : t('documents.status.optional')
          }
        </Badge>
      </div>
    )
  }

  const renderStepData = (step: ProcedureStep) => {
    const stepData = data[`step_${step.id}`]
    if (!stepData) return null

    return (
      <div className="space-y-2">
        {Object.entries(stepData).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-muted-foreground">
              {t(`fields.${key}`)}
            </span>
            <span>{value as string}</span>
          </div>
        ))}
      </div>
    )
  }

  const isComplete = procedure.requiredDocuments.every(
    type => data.documents?.[type]
  )

  return (
    <div className="space-y-6">
      <Alert variant={isComplete ? "default" : "destructive"}>
        {isComplete ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        <AlertTitle>
          {isComplete
            ? t('review.complete.title')
            : t('review.incomplete.title')
          }
        </AlertTitle>
        <AlertDescription>
          {isComplete
            ? t('review.complete.description')
            : t('review.incomplete.description')
          }
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t('review.documents.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...procedure.requiredDocuments, ...procedure.optionalDocuments].map(type => (
            <div key={type}>
              {renderDocumentStatus(type)}
            </div>
          ))}
        </CardContent>
      </Card>

      {procedure.steps.map(step => (
        <Card key={step.id}>
          <CardHeader>
            <CardTitle>{step.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepData(step)}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}