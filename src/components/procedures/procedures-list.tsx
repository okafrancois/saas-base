'use client'

import { useTranslations } from 'next-intl'
import { Procedure } from '@prisma/client'
import { ProcedureCard } from './procedure-card'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

interface ProceduresListProps {
  procedures: Procedure[]
  onStartProcedure: (id: string) => void
  disabledProcedures?: string[]
}

export function ProceduresList({
                                 procedures,
                                 onStartProcedure,
                                 disabledProcedures = []
                               }: ProceduresListProps) {
  const t = useTranslations('procedures')

  if (procedures.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t('empty.title')}
        description={t('empty.description')}
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {procedures.map((procedure) => (
        <ProcedureCard
          key={procedure.id}
          procedure={procedure}
          onStart={onStartProcedure}
          disabled={disabledProcedures.includes(procedure.id)}
        />
      ))}
    </div>
  )
}