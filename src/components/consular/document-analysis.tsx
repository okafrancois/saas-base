import * as React from "react"
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle2, AlertCircle, ScanLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface AnalysisStep {
  id: string
  status: 'pending' | 'processing' | 'success' | 'error'
  progress?: number
  result?: {
    isValid: boolean
    message?: string
    details?: string[]
  }
}

interface DocumentAnalysisProps {
  steps: AnalysisStep[]
  onAnalysisComplete?: (results: AnalysisStep[]) => void
  className?: string
}

export function DocumentAnalysis({
                                   steps,
                                   onAnalysisComplete,
                                   className,
                                 }: DocumentAnalysisProps) {
  const t = useTranslations('consular.analysis')
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  const statusIcons = {
    pending: ScanLine,
    processing: Loader2,
    success: CheckCircle2,
    error: AlertCircle,
  }

  const getStepLabel = (step: AnalysisStep) => {
    switch (step.id) {
      case 'format':
        return t('steps.format')
      case 'authenticity':
        return t('steps.authenticity')
      case 'data_extraction':
        return t('steps.data_extraction')
      case 'validation':
        return t('steps.validation')
      default:
        return step.id
    }
  }

  return (
    <div className={cn("space-y-6 rounded-lg border p-4", className)}>
      {/* En-tête avec bouton d'analyse */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {t('title')}
        </h3>
        <Button
          size="sm"
          onClick={() => setIsAnalyzing(true)}
          disabled={isAnalyzing}
          className="gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('analyzing')}
            </>
          ) : (
            <>
              <ScanLine className="h-4 w-4" />
              {t('start_analysis')}
            </>
          )}
        </Button>
      </div>

      {/* Étapes d'analyse avec animations */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {steps.map((step) => {
            const Icon = statusIcons[step.status]
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
              >
                {/* En-tête de l'étape */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "h-5 w-5",
                      step.status === 'processing' && "animate-spin",
                      step.status === 'success' && "text-success",
                      step.status === 'error' && "text-destructive"
                    )} />
                    <span className="font-medium">
                      {getStepLabel(step)}
                    </span>
                  </div>
                  {step.status === 'processing' && step.progress && (
                    <span className="text-sm text-muted-foreground">
                      {step.progress}%
                    </span>
                  )}
                </div>

                {/* Barre de progression */}
                {step.status === 'processing' && step.progress && (
                  <Progress value={step.progress} className="h-1" />
                )}

                {/* Résultat de l'étape */}
                {step.result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-md bg-muted p-2"
                  >
                    <p className={cn(
                      "text-sm",
                      step.result.isValid ? "text-success" : "text-destructive"
                    )}>
                      {step.result.message}
                    </p>
                    {step.result.details && step.result.details.length > 0 && (
                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                        {step.result.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Message d'aide */}
      <p className="text-sm text-muted-foreground">
        {t('help_text')}
      </p>
    </div>
  )
}