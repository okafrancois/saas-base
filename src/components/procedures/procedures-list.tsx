'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, ArrowRight } from 'lucide-react'
import { ConsularProcedure } from '@/types/procedure'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { PAGE_ROUTES } from '@/schemas/app-routes'

interface ProceduresListProps {
  userId: string
  procedures: ConsularProcedure[]
}

export function ProceduresList({ procedures }: ProceduresListProps) {
  const t = useTranslations('procedures')

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {procedures.map((procedure) => (
        <Card key={procedure.id} className="relative overflow-hidden">
          {procedure.urgent && (
            <div className="absolute right-0 top-0 bg-destructive px-2 py-1 text-xs font-medium text-white">
              {t('urgent')}
            </div>
          )}

          <CardHeader>
            <CardTitle>{t(`types.${procedure.id}.title`)}</CardTitle>
            <CardDescription>
              {t(`types.${procedure.id}.description`)}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {t('estimated_time')}: {procedure.estimatedTime}
              </div>

              {procedure.cost && (
                <div className="text-sm">
                  {t('cost')}: {procedure.cost} €
                </div>
              )}

              <Link
                href={PAGE_ROUTES.procedure_start(procedure.id)}
                className={buttonVariants({ className: "w-full mt-4" })}
              >
                {t('start_procedure')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}