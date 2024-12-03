'use client'
import { useTranslations } from 'next-intl'
import { DocumentType } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField } from '@/components/ui/form'
import { DocumentUploadField } from '@/components/ui/document-upload'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Définir le schéma de validation pour les documents
const createDocumentsSchema = (requiredDocuments: DocumentType[]) => {
  const schema: Record<string, z.ZodType> = {}

  requiredDocuments.forEach(doc => {
    schema[doc] = requiredDocuments.includes(doc)
      ? z.any().refine((file) => file instanceof File, 'required_document')
      : z.any().optional()
  })

  return z.object(schema)
}

interface DocumentsStepProps {
  existingDocuments: DocumentType[]
  requiredDocuments: DocumentType[]
  optionalDocuments?: DocumentType[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: Record<string, unknown>) => void
  defaultValues?: Record<string, unknown>
  isLoading?: boolean
}

export function DocumentsStep({
                                existingDocuments,
                                requiredDocuments,
                                optionalDocuments = [],
                                onSubmit,
                                isLoading,
  defaultValues
                              }: DocumentsStepProps) {
  const t = useTranslations('consular.services.form')

  // Initialiser le formulaire avec le schéma
  const form = useForm({
    resolver: zodResolver(createDocumentsSchema(requiredDocuments)),
    defaultValues
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Documents existants */}
        {existingDocuments.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">
              {t('documents.existing.title')}
            </h3>
            <div className="grid gap-4">
              {existingDocuments.map(doc => (
                <div
                  key={doc}
                  className="flex items-center gap-3 rounded-lg border p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium">
                      {t(`documents.types.${doc.toLowerCase()}`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('documents.existing.already_provided')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents à fournir */}
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('documents.alert.title')}</AlertTitle>
            <AlertDescription>
              {t('documents.alert.description')}
            </AlertDescription>
          </Alert>

          <div className="grid gap-6">
            <AnimatePresence mode="sync">
              {[...requiredDocuments, ...optionalDocuments].map((doc, index) => (
                <motion.div
                  key={doc}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FormField
                    control={form.control}
                    name={doc}
                    render={({ field }) => (
                      <DocumentUploadField
                        id={doc.toLowerCase()}
                        label={t(`documents.types.${doc.toLowerCase()}`)}
                        description={t(`documents.descriptions.${doc.toLowerCase()}`)}
                        accept="image/*,.pdf"
                        maxSize={5 * 1024 * 1024}
                        required={requiredDocuments.includes(doc)}
                        disabled={isLoading}
                        field={field}
                        form={form}
                      />
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </form>
    </Form>
  )
}