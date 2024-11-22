"use client"

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScanBarcode } from 'lucide-react'
import LottieAnimation from '@/components/ui/lottie-animation'
import { DocumentsFormData } from '@/schemas/registration'
import { DocumentUploadField } from '@/components/ui/document-upload'
import { Form, FormField } from '@/components/ui/form'
import { UseFormReturn } from 'react-hook-form'

interface DocumentUploadSectionProps {
  form: UseFormReturn<DocumentsFormData>
  handleSubmit: (data: DocumentsFormData) => void
  handleAnalysis?: () => void
  isLoading?: boolean
  formRef?: React.RefObject<HTMLFormElement>
}

export function DocumentUploadSection({
                                        form,handleSubmit, isLoading,handleAnalysis, formRef
                                      }: DocumentUploadSectionProps) {
  const t = useTranslations('registration')

  const requiredDocuments = [
    {
      id: 'passportFile' as const,
      label: t('documents.passport.label'),
      description: t('documents.passport.description'),
      required: true
    },
    {
      id: 'birthCertificateFile' as const,
      label: t('documents.birth_certificate.label'),
      description: t('documents.birth_certificate.description'),
      required: true
    },
    {
      id: 'residencePermitFile' as const,
      label: t('documents.residence_permit.label'),
      description: t('documents.residence_permit.description'),
      required: false
    },
    {
      id: 'addressProofFile' as const,
      label: t('documents.address_proof.label'),
      required: true,
      description: t('documents.address_proof.description'),
    }
  ]

  const documentTips = [
    t('documents.tips.list.quality'),
    t('documents.tips.list.lighting'),
    t('documents.tips.list.reflection'),
    t('documents.tips.list.corners'),
    t('documents.tips.list.validity')
  ]

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Section des documents */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 ">
          <AnimatePresence mode="sync">
            {requiredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FormField
                  control={form.control}
                  name={doc.id}
                  render={({ field }) => (
                      <DocumentUploadField
                        id={doc.id}
                        field={field}
                        label={doc.label}
                        required={doc.required}
                        description={doc.description}
                        form={form}
                        accept="image/*,application/pdf"
                        disabled={isLoading}
                      />
                  )}
                />

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Section d'analyse */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Button
                type="button"
                onClick={handleAnalysis}
                disabled={isLoading}
                className="w-full gap-2 md:w-auto"
              >
                {isLoading ? (
                  <>
                    <LottieAnimation
                      src="https://lottie.host/3dcbeb73-3c3f-4dbe-93de-a973430b6c4c/aX6F1INJXN.json"
                      className="h-5 w-5"
                    />
                    {t('documents.analysis.analyzing')}
                  </>
                ) : (
                  <>
                    <ScanBarcode className="h-5 w-5" />
                    {t('documents.analysis.start')}
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground">
                {t('documents.analysis.help')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Guide d'aide */}
        <div className="rounded-lg bg-muted p-4">
          <h3 className="font-medium">
            {t('documents.tips.title')}
          </h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {documentTips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {tip}
              </motion.li>
            ))}
          </ul>
        </div>
      </form>
    </Form>
  )
}