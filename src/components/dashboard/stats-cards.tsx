import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { UserStats } from '@/types/stats'
import { UserIcon } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface StatsCardsProps {
  stats: UserStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations('dashboard')

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('cards.profile.title')}
          </CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.profileCompletionRate}%</div>
          <Progress value={stats.profileCompletionRate} className="mt-2" />
        </CardContent>
      </Card>
      {/* Autres cartes statistiques similaires */}
    </div>
  )
}