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


  const t = useTranslations('dashboard.sections.profile')

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
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

        {/* Champs manquants - masqués sur mobile si plus de 2 */}
        {stats.missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('missing_fields')}:</p>
            <ul className="space-y-1">
              {stats.missingFields.slice(0, 2).map((field) => (
                <li key={field} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  {t(`fields.${field}`)}
                </li>
              ))}
              {stats.missingFields.length > 2 && (
                <li className="text-sm text-muted-foreground">
                  {t('and_more', { count: stats.missingFields.length - 2 })}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => onAction('view_profile')}
          >
            {t('actions.view')}
          </Button>
          <Button
            size="sm"
            onClick={() => onAction('complete_profile')}
          >
            {t('actions.complete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}