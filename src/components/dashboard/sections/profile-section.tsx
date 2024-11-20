"use client"

import { useTranslations } from 'next-intl'
import { UserCircle, AlertCircle, CheckCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardSectionStats } from '@/types/dashboard'

interface ProfileSectionProps {
  stats: DashboardSectionStats['profile']
  onAction: (action: string) => void
}

export function ProfileSection({ stats, onAction }: ProfileSectionProps) {
  const t = useTranslations('profile.dashboard.sections.profile')

  if (!stats) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <Badge variant={stats.status === 'ACTIVE' ? 'success' : 'warning'}>
            {t(`status.${stats.status.toLowerCase()}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Taux de complétion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t('completion')}</span>
            <span>{stats.completionRate}%</span>
          </div>
          <Progress value={stats.completionRate} />
        </div>

        {/* Champs manquants */}
        {stats.missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('missing_fields')}:</p>
            <ul className="space-y-1">
              {stats.missingFields.map((field) => (
                <li key={field} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  {t(`fields.${field}`)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onAction('view_profile')}
          >
            {t('actions.view')}
          </Button>
          <Button
            onClick={() => onAction('complete_profile')}
          >
            {t('actions.complete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}