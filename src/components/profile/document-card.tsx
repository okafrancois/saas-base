import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Download, AlertTriangle } from 'lucide-react'
import type { ProfileDocument } from '@/types/profile'

interface DocumentCardProps {
  document: ProfileDocument
  onView?: (doc: ProfileDocument) => void
  onDownload?: (doc: ProfileDocument) => void
}

export function DocumentCard({
                               document,
                               onView,
                               onDownload
                             }: DocumentCardProps) {
  const t = useTranslations('profile.documents')

  const isExpired = document.expiresAt && new Date(document.expiresAt) < new Date()

  return (
    <Card className="relative">
      {isExpired && (
        <div className="absolute right-2 top-2">
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t('status.expired')}
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {t(`types.${document.type.toLowerCase()}`)}
          </h3>
          <Badge variant={document.status.toLowerCase()}>
            {t(`status.${document.status.toLowerCase()}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        {document.metadata.documentNumber && (
          <p>
            <span className="text-muted-foreground">{t('number')}: </span>
            {document.metadata.documentNumber}
          </p>
        )}
        <p>
          <span className="text-muted-foreground">{t('issued_at')}: </span>
          {format(new Date(document.issuedAt), 'PPP', { locale: fr })}
        </p>
        {document.expiresAt && (
          <p>
            <span className="text-muted-foreground">{t('expires_at')}: </span>
            {format(new Date(document.expiresAt), 'PPP', { locale: fr })}
          </p>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView?.(document)}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          {t('actions.view')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload?.(document)}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {t('actions.download')}
        </Button>
      </CardFooter>
    </Card>
  )
}