"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, TradFormMessage } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { FormError } from '@/components/form-error'
import { Button } from '@/components/ui/button'
import { getFieldsForDocument } from '@/lib/document-fields'
import { DocumentField } from '@/lib/utils'
import { ScanBarcode } from 'lucide-react'
import { analyzeDocuments } from '@/actions/documents'
import LottieAnimation from '@/components/ui/lottie-animation'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { AnalysisData } from '@/types'
import { DocumentsFormData, DocumentsSchema } from '@/schemas/registration'
import DocumentUploadField from '@/components/ui/document-upload'

interface DocumentsFormProps {
  onSubmit: (data: DocumentsFormData) => void
  defaultValues?: Partial<DocumentsFormData>
  isLoading?: boolean
  formRef?: React.RefObject<HTMLFormElement>
  onDocumentsAnalysisComplete?: (data: AnalysisData) => void
  nextStep?: () => void
}

export function DocumentsUploadForm({
                                      onSubmit,
                                      defaultValues,
                                      formRef,
                                      isLoading,
                                      onDocumentsAnalysisComplete,
                                      nextStep
                                    }: Readonly<DocumentsFormProps>) {
  const { toast } = useToast()
  const t = useTranslations('registration')

  const [error, setError] = React.useState<string | undefined>()
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  const form = useForm<DocumentsFormData>({
    resolver: zodResolver(DocumentsSchema),
    defaultValues,
    reValidateMode: 'onChange',
  })

  const handleSubmit = (data: DocumentsFormData) => {
    try {
      setError(undefined)
      console.log(data)
      onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknown'))
    }
  }

  const handleAnalysis = async () => {
    const formData = form.getValues()
    const analysisFormData = new FormData()
    const analysisFields: {key: keyof DocumentsFormData, fields: DocumentField[]}[] = []

    // Collecter les documents
    Object.entries(formData).forEach(([key, fileList]) => {
      if (fileList?.[0]) {
        const documentFields = getFieldsForDocument(key as keyof DocumentsFormData)
        analysisFields.push({
          key: key as keyof DocumentsFormData,
          fields: documentFields
        })
        analysisFormData.append(key, fileList[0])
      }
    })

    if (analysisFields.length === 0) {
      setError(t('documents.analysis.error.no_documents'))
      return
    }

    setError(undefined)
    setIsAnalyzing(true)

    try {
      const results = await analyzeDocuments(analysisFormData, analysisFields)

      if (results.success && results.mergedData) {
        if (onDocumentsAnalysisComplete) {
          onDocumentsAnalysisComplete(results.mergedData as AnalysisData)
        }

        toast({
          title: t('documents.analysis.success.title'),
          description: t('documents.analysis.success.description'),
          variant: "success",
          action: nextStep && (
            <ToastAction altText={t('documents.analysis.success.action')} onClick={nextStep}>
              {t('documents.analysis.success.action')}
            </ToastAction>
          ),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknown'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const documents = [
    {
      id: 'passportFile' as const,
      label: t('documents.passport.label'),
      description: t('documents.passport.description'),
      existing: defaultValues?.passportFile,
      required: true,
    },
    {
      id: 'birthCertificateFile' as const,
      label: t('documents.birth_certificate.label'),
      description: t('documents.birth_certificate.description'),
      existing: defaultValues?.birthCertificateFile,
      required: true,
    },
    {
      id: 'residencePermitFile' as const,
      label: t('documents.residence_permit.label'),
      description: t('documents.residence_permit.description'),
      existing: defaultValues?.residencePermitFile,
    },
    {
      id: 'addressProofFile' as const,
      label: t('documents.address_proof.label'),
      description: t('documents.address_proof.description'),
      existing: defaultValues?.addressProofFile,
      required: true,
    },
  ]

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-x-2 gap-y-6 md:grid-cols-4">
          {documents.map(doc => (
            <FormField
              key={doc.id}
              control={form.control}
              name={doc.id}
              render={() => (
                <FormItem className="w-full">
                  <FormLabel className={"text-xs"}>
                    {doc.label}
                    {doc.required && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <DocumentUploadField
                      id={doc.id}
                      field={form.register(doc.id)}
                      form={form}
                      disabled={isLoading}
                      existingFile={doc.existing}
                    />
                  </FormControl>
                  <TradFormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button
            type="button"
            onClick={handleAnalysis}
            disabled={isAnalyzing || isLoading}
            className="w-full md:w-max"
          >
            {isAnalyzing ? (
              <>
                <LottieAnimation
                  src="https://lottie.host/3dcbeb73-3c3f-4dbe-93de-a973430b6c4c/aX6F1INJXN.json"
                  className="w-10 h-10"
                />
                <span>{t('documents.analysis.analyzing')}</span>
              </>
            ) : (
              <>
                <ScanBarcode className="h-4 w-4 mr-2" />
                {t('documents.analysis.button')}
              </>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t('documents.analysis.help_text')}
          </p>
        </div>

        {error && <FormError message={error} />}
      </form>
    </Form>
  )
}