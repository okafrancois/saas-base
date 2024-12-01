'use client'

import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ProcedureRequest, ProcedureStatus } from '@prisma/client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, ArrowRight } from 'lucide-react'

interface ProcedureRequestCardProps {
  request: ProcedureRequest & {
    procedure: { title: string; type: string }
  }
  onView: (id: string) => void
}

export function ProcedureRequestCard({ request, onView }: ProcedureRequestCardProps) {
  const t = useTranslations('procedures')

  const getStatusColor = (status: ProcedureStatus): "default" | "success" | "warning" | "destructive" => {
    switch (status) {
      case 'COMPLETED':
        return 'success'
      case 'REJECTED':
        return 'destructive'
      case 'IN_REVIEW':
      case 'ADDITIONAL_INFO_NEEDED':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t(`types.${request.procedure.type.toLowerCase()}`)}
          </CardTitle>
          <Badge variant={getStatusColor(request.status)}>
            {t(`status.${request.status.toLowerCase()}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {t('submitted_on', {
              date: format(new Date(request.createdAt), 'PPP', { locale: fr })
            })}
          </span>
        </div>

        {request.submittedAt && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {t('last_update', {
                date: format(new Date(request.submittedAt), 'PPP', { locale: fr })
              })}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="ghost"
          className="ml-auto"
          onClick={() => onView(request.id)}
        >
          {t('actions.view')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}