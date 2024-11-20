"use client"

import { useTranslations } from 'next-intl'
import { FileText, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardSectionStats } from '@/types/dashboard'

interface RequestsSectionProps {
  stats: DashboardSectionStats['requests']
  onAction: (action: string) => void
}

export function RequestsSection({ stats, onAction }: RequestsSectionProps) {
  const t = useTranslations('profile.dashboard.sections.requests')

  if (!stats) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('new_request')}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('actions.new')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiques des demandes */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">{t('status.pending')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <div className="text-xs text-muted-foreground">{t('status.in_progress')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">{t('status.completed')}</div>
          </div>
        </div>

        {/* Dernière demande */}
        {stats.latestRequest && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {t('latest_request')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('view_request')}
              >
                {t('actions.view')}
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {t(`request_types.${stats.latestRequest.type}`)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}