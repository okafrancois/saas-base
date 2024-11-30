'use client'

import { useTranslations } from 'next-intl'
import { Profile } from '@prisma/client'
import { ConsularProcedure } from '@/types/procedure'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ArrowRight, Upload } from 'lucide-react'
import Link from 'next/link'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ProcedureRequirementsProps {
  procedure: ConsularProcedure
  profile: Profile | null
}

export function ProcedureRequirements({ procedure, profile }: ProcedureRequirementsProps) {
  const t = useTranslations('procedures')
  const [isChecking, setIsChecking] = useState(false)

  // Vérifier si un document est présent dans le profil
  const checkDocument = (documentType: string) => {
    if (!profile) return false
    return profile[`${documentType.toLowerCase()}Id` as keyof Profile] !== null
  }

  // Vérifier si une information est présente dans le profil
  const checkInformation = (field: string) => {
    if (!profile) return false
    return !!profile[field as keyof Profile]
  }

  // Calculer le nombre de prérequis complétés
  const completedRequirements = procedure.requirements.filter(req => {
    if (req.type === 'DOCUMENT') {
      return req.documentType && checkDocument(req.documentType)
    }
    return req.field && checkInformation(req.field)
  }).length

  // Vérifier si tous les prérequis obligatoires sont remplis
  const canProceed = procedure.requirements
    .filter(req => req.required)
    .every(req => {
      if (req.type === 'DOCUMENT') {
        return req.documentType && checkDocument(req.documentType)
      }
      return req.field && checkInformation(req.field)
    })

  return (
    <div className="space-y-6">
      {/* En-tête avec progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('requirements.title')}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {completedRequirements}/{procedure.requirements.length} {t('requirements.completed')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {procedure.requirements.map((requirement) => {
              const isComplete = requirement.type === 'DOCUMENT'
                ? (requirement.documentType && checkDocument(requirement.documentType))
                : (requirement.field && checkInformation(requirement.field))

              return (
                <div
                  key={requirement.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4",
                    isComplete ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {isComplete ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {t(requirement.description)}
                        {requirement.required && (
                          <span className="ml-1 text-sm text-red-500">*</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isComplete
                          ? t('requirements.document_ready')
                          : t('requirements.document_missing')}
                      </p>
                    </div>
                  </div>

                  {!isComplete && (
                    <Link
                      href={requirement.type === 'DOCUMENT'
                        ? `${PAGE_ROUTES.documents}?upload=${requirement.documentType}`
                        : `${PAGE_ROUTES.profile}?section=${requirement.field}`
                      }
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      {requirement.type === 'DOCUMENT' ? (
                        <>
                          <Upload className="h-4 w-4" />
                          {t('requirements.upload')}
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4" />
                          {t('requirements.complete')}
                        </>
                      )}
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          {t('actions.cancel')}
        </Button>

        <Button
          disabled={!canProceed || isChecking}
          onClick={() => {
            setIsChecking(true)
            // Redirection vers le formulaire de la démarche
            window.location.href = `${PAGE_ROUTES.procedures}/${procedure.id}/form`
          }}
        >
          {isChecking ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t('actions.checking')}
            </span>
          ) : (
            <>
              {t('actions.continue')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}