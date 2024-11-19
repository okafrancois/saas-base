
import * as React from "react"
import { useTranslations } from 'next-intl'
import { motion } from "framer-motion"
import { DocumentUploadField } from './document-upload-field'
import { DocumentAnalysis } from './document-analysis'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface DocumentUploadSectionProps {
  onAnalysisComplete?: (data: any) => void
  onContinue?: () => void
  className?: string
}

export function DocumentUploadSection({
                                        onAnalysisComplete,
                                        onContinue,
                                        className
                                      }: DocumentUploadSectionProps) {
  const t = useTranslations('consular.documents')
  const { toast } = useToast()
  const [files, setFiles] = React.useState<Record<string, File | null>>({})
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  const requiredDocuments = [
    {
      id: 'passport',
      label: t('types.passport'),
      description: t('descriptions.passport'),
      required: true
    },
    {
      id: 'identity_photo',
      label: t('types.identity_photo'),
      description: t('descriptions.identity_photo'),
      required: true
    },
    {
      id: 'birth_certificate',
      label: t('types.birth_certificate'),
      description: t('descriptions.birth_certificate'),
      required: true
    },
    {
      id: 'proof_of_address',
      label: t('types.proof_of_address'),
      description: t('descriptions.proof_of_address'),
      required: true
    }
  ]

  const handleFileChange = (id: string, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [id]: file
    }))
  }

  const canAnalyze = React.useMemo(() => {
    return requiredDocuments
      .filter(doc => doc.required)
      .every(doc => files[doc.id])
  }, [files])

  const handleAnalysisComplete = (results: any) => {
    toast({
      title: t('analysis.success.title'),
      description: t('analysis.success.description'),
      action: onContinue && (
        <Button onClick={onContinue} size="sm">
          {t('analysis.success.action')}
        </Button>
      )
    })
    onAnalysisComplete?.(results)
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Section de téléchargement */}
      <div className="grid gap-6 md:grid-cols-2">
        {requiredDocuments.map(doc => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DocumentUploadField
              id={doc.id}
              label={doc.label}
              description={doc.description}
              required={doc.required}
              onChange={(file) => handleFileChange(doc.id, file)}
              value={files[doc.id]}
            />
          </motion.div>
        ))}
      </div>

      {/* Section d'analyse */}
      {canAnalyze && (
        <DocumentAnalysis
          onAnalysisComplete={handleAnalysisComplete}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
        />
      )}

      {/* Message d'aide */}
      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        <p>{t('help_text')}</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {t('help_tips', { returnObjects: true }).map((tip: string, index: number) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}