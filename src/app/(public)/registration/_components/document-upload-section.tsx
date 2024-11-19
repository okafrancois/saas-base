import React from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ScanBarcode } from 'lucide-react'
import { analyzeDocuments } from '@/actions/documents'
import LottieAnimation from '@/components/ui/lottie-animation'
import { DocumentsFormData } from '@/schemas/registration'
import { DocumentUploadField } from '@/components/ui/document-upload'
import { getFieldsForDocument } from '@/lib/document-fields'
import { DocumentField } from '@/lib/utils'

interface DocumentUploadSectionProps {
  onAnalysisComplete?: (data: any) => void
  defaultValues?: Partial<DocumentsFormData>
  formRef?: React.RefObject<HTMLFormElement>
}

export function DocumentUploadSection({
                                        onAnalysisComplete,
                                        defaultValues,
                                        formRef
                                      }: DocumentUploadSectionProps) {
  const t = useTranslations('registration')
  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [error, setError] = React.useState<string>()

  const requiredDocuments = [
    {
      id: 'passportFile',
      label: t('documents.passport.label'),
      description: t('documents.passport.description'),
      required: true
    },
    {
      id: 'birthCertificateFile',
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
      id: 'addressProofFile',
      label: t('documents.address_proof.label'),
      existing: defaultValues?.addressProofFile,
      required: true,
      description: t('documents.address_proof.description'),
    }
  ]

  const handleAnalysis = async (formData: FormData) => {
    console.log('formData', formData.getAll('passportFile'))

    const analysisFormData = new FormData()
    const analysisFields: {key: keyof DocumentsFormData, fields: DocumentField[]}[] = []

    // Collecter les documents et leurs champs respectifs
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
      toast({
        title: t('documents.analysis.error.title'),
        description: t('documents.analysis.error.no_document'),
        variant: "destructive"
      })
      setError(t('documents.analysis.error.no_documents'))
      return
    }

    setIsAnalyzing(true)
    setError(undefined)

    try {
      console.log('analysisFormData', analysisFormData)
      const results = await analyzeDocuments(analysisFormData, analysisFields, 'gpt')

      if (results.success && results.mergedData) {
        toast({
          title: t('documents.analysis.success.title'),
          description: t('documents.analysis.success.description'),
          variant: "success"
        })
        onAnalysisComplete?.(results.mergedData)
      } else {
        throw new Error(results.error || t('documents.analysis.error.unknown'))
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t('errors.unknown'))
      toast({
        title: t('documents.analysis.error.title'),
        description: error instanceof Error ? error.message : t('errors.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const documentTips = [
    t('documents.tips.list.quality'),
    t('documents.tips.list.lighting'),
    t('documents.tips.list.reflection'),
    t('documents.tips.list.corners'),
    t('documents.tips.list.validity')
  ]

  return (
    <form ref={formRef} className="space-y-8">
      {/* Section des documents */}
      <div className="grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="sync">
          {requiredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DocumentUploadField
                id={doc.id}
                label={doc.label}
                description={doc.description}
                required={doc.required}
                accept="image/*,application/pdf"
                maxSize={5}
                defaultValue={defaultValues?.[doc.id as keyof DocumentsFormData]}
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
              onClick={() => {
                const form = formRef?.current
                if (form) {
                  const formData = new FormData(form)
                  handleAnalysis(formData)
                }
              }}
              disabled={isAnalyzing}
              className="w-full gap-2 md:w-auto"
            >
              {isAnalyzing ? (
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
  )
}