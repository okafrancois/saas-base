'use client'

import { useRouter } from 'next/navigation'
import { DocumentsSection } from './documents-section'
import { DocumentWithMetadata } from '@/types/document'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { Route } from 'next'

interface DocumentsSectionClientProps {
  documents: DocumentWithMetadata[]
}

export function DocumentsSectionClient({ documents }: DocumentsSectionClientProps) {
  const router = useRouter()

  const handleAddDocument = () => {
    router.push(`${PAGE_ROUTES.documents}/upload` as Route<string>)
  }

  const handleViewDocument = (doc: DocumentWithMetadata) => {
    router.push(`${PAGE_ROUTES.documents}/${doc.id}` as Route<string>)
  }

  const handleDownloadDocument = async (doc: DocumentWithMetadata) => {
    try {
      const response = await fetch(doc.fileUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${doc.type.toLowerCase()}.${doc.fileUrl.split('.').pop()}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  return (
    <DocumentsSection
      documents={documents}
      onAddDocument={handleAddDocument}
      onViewDocument={handleViewDocument}
      onDownloadDocument={handleDownloadDocument}
    />
  )
}