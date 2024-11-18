"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, TradFormMessage } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { FormError } from '@/components/form-error'
import DocumentUploadField from '@/components/ui/document-upload'
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
  const t = useTranslations('consular_registration')
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
      onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  export function DocumentsUploadForm({
                                        onSubmit,
                                        defaultValues,
                                        formRef,
                                        isLoading,
                                        onDocumentsAnalysisComplete,
                                        nextStep
                                      }: DocumentsUploadFormProps) {
    const { toast } = useToast()
    const t = useTranslations('consular_registration')
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const handleAnalysis = async () => {
      const formData = form.getValues()
      // Vérifier si des documents sont présents
      if (!hasRequiredDocuments(formData)) {
        toast({
          title: t('documents.error.missing_documents'),
          description: t('documents.error.upload_required_documents'),
          variant: "destructive"
        })
        return
      }

      setIsAnalyzing(true)
      try {
        const results = await analyzeDocuments(/* ... */)

        if (results.success) {
          onDocumentsAnalysisComplete?.(results.mergedData)

          toast({
            title: t('documents.analysis.success.title'),
            description: t('documents.analysis.success.description'),
            variant: "success",
            action: nextStep && (
              <ToastAction
                altText={t('documents.analysis.success.action_hint')}
                onClick={nextStep}
              >
                {t('documents.analysis.success.action')}
              </ToastAction>
            )
          })
        }
      } catch (error) {
        toast({
          title: t('documents.analysis.error.failed_analysis'),
          description: error instanceof Error ? error.message : t('errors.common.unknown_error'),
          variant: "destructive",
          action: (
            <ToastAction
              altText={t('documents.analysis.error.retry')}
              onClick={handleAnalysis}
            >
              {t('documents.analysis.error.retry')}
            </ToastAction>
          )
        })
      } finally {
        setIsAnalyzing(false)
      }
    }

  const documents = [
    {
      id: 'passportFile' as const,
      label: t('documents.passport.label'),
      existing: defaultValues?.passportFile,
      required: true,
    },
    {
      id: 'birthCertificateFile' as const,
      label: t('documents.birth_certificate.label'),
      existing: defaultValues?.birthCertificateFile,
      required: true,
    },
    {
      id: 'residencePermitFile' as const,
      label: t('documents.residence_permit.label'),
      existing: defaultValues?.residencePermitFile,
    },
    {
      id: 'addressProofFile' as const,
      label: t('documents.address_proof.label'),
      existing: defaultValues?.addressProofFile,
      required: true,
    },
  ]

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {documents.map(doc => (
            <FormField
              key={doc.id}
              control={form.control}
              name={doc.id}
              render={() => (
                <FormItem className="w-full">
                  <FormLabel>
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

        <div className="flex flex-col gap-2 items-center justify-center">
          <Button
            type="button"
            onClick={handleAnalysis}
            disabled={isAnalyzing || isLoading}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-14 h-14">
                  <LottieAnimation
                    src="https://lottie.host/3dcbeb73-3c3f-4dbe-93de-a973430b6c4c/aX6F1INJXN.json"
                    className="w-full h-full"
                  />
                </div>
                <span>
                  {t('documents.analysis.analyzing')}
                </span>
              </>
            ) : (
              <>
                <ScanBarcode className="h-4 w-4" />
                {t('documents.analysis.button')}
              </>
            )}
          </Button>

          <p className="text-center text-xs bg-muted rounded-md p-2 opacity-[0.7]">
            {t('documents.analysis.help_text')}
          </p>
        </div>

        {(error) && <FormError message={error} />}
      </form>
    </Form>
  )
}