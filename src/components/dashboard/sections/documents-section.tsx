"use client"

import { useTranslations } from 'next-intl'
import { FileText, AlertTriangle, CheckCircle, Clock, Upload, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardSectionStats } from '@/types/dashboard'
import { Progress } from '@/components/ui/progress'

interface DocumentsSectionProps {
  stats: DashboardSectionStats['documents']
  onAction: (action: string) => void
}

export function DocumentsSection({ stats, onAction }: DocumentsSectionProps) {
  const t = useTranslations('profile.dashboard.sections.documents')

  if (!stats) return null
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <FileText className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('upload_document')}
          >
            <Upload className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">{t('actions.upload')}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* État des documents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t('validity_status')}</span>
            <span>{Math.round((stats.valid / stats.total) * 100)}% {t('valid')}</span>
          </div>
          <Progress value={(stats.valid / stats.total) * 100} />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border p-2 text-center">
            <CheckCircle className="mx-auto h-4 w-4 text-success" />
            <div className="mt-1 text-xl font-bold">{stats.valid}</div>
            <div className="text-xs text-muted-foreground">{t('status.valid')}</div>
          </div>
          <div className="rounded-lg border p-2 text-center">
            <Clock className="mx-auto h-4 w-4 text-warning" />
            <div className="mt-1 text-xl font-bold">{stats.expiringSoon}</div>
            <div className="text-xs text-muted-foreground">{t('status.expiring_soon')}</div>
          </div>
          <div className="rounded-lg border p-2 text-center md:col-span-2">
            <AlertTriangle className="mx-auto h-4 w-4 text-destructive" />
            <div className="mt-1 text-xl font-bold">{stats.expired}</div>
            <div className="text-xs text-muted-foreground">{t('status.expired')}</div>
          </div>
        </div>

        {/* Dernier document */}
        {stats.latestDocument && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('latest_document')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('view_document')}
                className="h-8 w-8 p-0 md:h-9 md:w-auto md:px-3"
              >
                <ArrowRight className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{t('actions.view')}</span>
              </Button>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                {t(`document_types.${stats.latestDocument.type}`)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('expires_on')}: {new Date(stats.latestDocument.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}