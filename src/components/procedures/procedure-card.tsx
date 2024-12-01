'use client'

import { Procedure } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, FileText, AlertCircle } from 'lucide-react'

interface ProcedureCardProps {
  procedure: Procedure
  onStart?: (id: string) => void
  disabled?: boolean
}

export function ProcedureCard({ procedure, onStart, disabled }: ProcedureCardProps) {
  const t = useTranslations('procedures')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t(`types.${procedure.type.toLowerCase()}`)}
          </CardTitle>
          <Badge variant={disabled ? "outline" : "default"}>
            {disabled ? t('status.unavailable') : t('status.available')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {procedure.description}
        </p>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{procedure.estimatedTime || t('estimated_time.unknown')}</span>
        </div>

        {procedure.requiredDocuments.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>
              {t('required_documents', { count: procedure.requiredDocuments.length })}
            </span>
          </div>
        )}

        {disabled && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{t('messages.complete_profile')}</span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onStart?.(procedure.id)}
          disabled={disabled}
          className="w-full"
        >
          {t('actions.start')}
        </Button>
      </CardFooter>
    </Card>
  )
}