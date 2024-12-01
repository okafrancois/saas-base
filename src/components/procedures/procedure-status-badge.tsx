import { ProcedureStatus } from '@prisma/client'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'

interface ProcedureStatusBadgeProps {
  status: ProcedureStatus
}

export function ProcedureStatusBadge({ status }: ProcedureStatusBadgeProps) {
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
    <Badge variant={getStatusColor(status)}>
      {t(`status.${status.toLowerCase()}`)}
    </Badge>
  )
}