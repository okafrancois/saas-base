import { useTranslations } from 'next-intl'
import { DocumentCard } from './document-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { DocumentWithMetadata } from '@/types/document'

interface DocumentsSectionProps {
  documents: DocumentWithMetadata[]
  onAddDocument?: () => void
  onViewDocument?: (doc: DocumentWithMetadata) => void
  onDownloadDocument?: (doc: DocumentWithMetadata) => void
}

export function DocumentsSection({
                                   documents,
                                   onAddDocument,
                                   onViewDocument,
                                   onDownloadDocument
                                 }: DocumentsSectionProps) {
  const t = useTranslations('profile.documents')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <Button onClick={onAddDocument} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t('actions.add')}
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">{t('empty')}</p>
          <Button
            variant="outline"
            onClick={onAddDocument}
            className="mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('actions.add_first')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={onViewDocument}
              onDownload={onDownloadDocument}
            />
          ))}
        </div>
      )}
    </div>
  )
}