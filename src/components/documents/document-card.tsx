'use client'

import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DocumentWithMetadata } from '@/types/document'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Download, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

interface DocumentCardProps {
  document: DocumentWithMetadata
}

export function DocumentCard({ document }: DocumentCardProps) {
  const t = useTranslations('documents')

  const getStatusIcon = () => {
    switch (document.status) {
      case 'VALIDATED':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'REJECTED':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleView = () => {
    window.open(document.fileUrl, '_blank')
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(document.fileUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${document.type.toLowerCase()}.${document.fileUrl.split('.').pop()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t(`types.${document.type.toLowerCase()}`)}
          </CardTitle>
          <Badge
            variant={
              document.status === 'VALIDATED'
                ? 'success'
                : document.status === 'REJECTED'
                  ? 'destructive'
                  : 'info'
            }
            className="ml-2"
          >
            {t(`status.${document.status.toLowerCase()}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">
              {t(`status.${document.status.toLowerCase()}`)}
            </span>
          </div>
          {document.expiresAt && (
            <p className="text-sm text-muted-foreground">
              {t('expires_on')}: {format(new Date(document.expiresAt), 'PPP', { locale: fr })}
            </p>
          )}
          {document.metadata?.documentNumber && (
            <p className="text-sm text-muted-foreground">
              N°: {document.metadata.documentNumber}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleView}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t('actions.view')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          {t('actions.download')}
        </Button>
      </CardFooter>
    </Card>
  )
}