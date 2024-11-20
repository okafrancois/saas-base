'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { ProfileStats } from '@/types/profile'

interface ProfileStatsProps {
  stats: ProfileStats
  className?: string
}

export function ProfileStats({ stats, className }: ProfileStatsProps) {
  const t = useTranslations('profile')

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('stats.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t('stats.completion')}</span>
            <span>{stats.profileCompletion}%</span>
          </div>
          <Progress value={stats.profileCompletion} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{stats.documentsCount}</p>
            <p className="text-xs text-muted-foreground">{t('stats.documents')}</p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold">{stats.requestsCount}</p>
            <p className="text-xs text-muted-foreground">{t('stats.requests')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}