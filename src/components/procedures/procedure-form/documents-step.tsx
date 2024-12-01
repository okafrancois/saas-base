'use client'

import { useTranslations } from 'next-intl'
import { DocumentType } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DocumentsSchema } from '@/schemas/procedures'
import { Form } from '@/components/ui/form'
import { DocumentUploadField } from '@/components/ui/document-upload'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface DocumentsStepProps {
  requiredDocuments: DocumentType[]
  optionalDocuments?: DocumentType[]
  onSubmit: (data: any) => void
  defaultValues?: any
}

export function DocumentsStep({
                                requiredDocuments,
                                optionalDocuments = [],
                                onSubmit,
                                defaultValues
                              }: DocumentsStepProps) {
  const t = useTranslations('procedures.form')
  const form = useForm({
    resolver: zodResolver(DocumentsSchema),
    defaultValues
  })

  const documents = [
    ...requiredDocuments.map(type => ({
      type,
      required: true
    })),
    ...optionalDocuments.map(type => ({
      type,
      required: false
    }))
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('documents.alert.title')}</AlertTitle>
          <AlertDescription>
            {t('documents.alert.description')}
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          {documents.map(({ type, required }) => (
            <DocumentUploadField
              key={type}
              id={`documents.${type.toLowerCase()}`}
              label={t(`documents.types.${type.toLowerCase()}`)}
              description={t(`documents.descriptions.${type.toLowerCase()}`)}
              accept="image/*,.pdf"
              maxSize={5 * 1024 * 1024}
              required={required}
              form={form}
              field={form.getValues(`documents.${type.toLowerCase()}`)}
            />
          ))}
        </div>
      </form>
    </Form>
  )
}