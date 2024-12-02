'use client'
import { useTranslations } from 'next-intl'
import { DocumentType } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { DocumentUploadField } from '@/components/ui/document-upload'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DocumentsStepProps {
  requiredDocuments: DocumentType[]
  optionalDocuments?: DocumentType[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues?: any
}

export function DocumentsStep({
                                requiredDocuments,
                                optionalDocuments = [],
                                onSubmit,
                                defaultValues
                              }: DocumentsStepProps) {
  const t = useTranslations('consular.services.form')
  const form = useForm({
    defaultValues
  })

  const documents = [
    ...requiredDocuments.map(type => ({ type, required: true })),
    ...optionalDocuments.map(type => ({ type, required: false }))
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
          <AnimatePresence mode="sync">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DocumentUploadField
                  id={`documents.${doc.type.toLowerCase()}`}
                  label={t(`documents.types.${doc.type.toLowerCase()}`)}
                  description={t(`documents.descriptions.${doc.type.toLowerCase()}`)}
                  accept="image/*,.pdf"
                  maxSize={5 * 1024 * 1024}
                  required={doc.required}
                  form={form}
                  field={form.register(`documents.${doc.type.toLowerCase()}`)} // Ajout de la prop field manquante
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </form>
    </Form>
  )
}