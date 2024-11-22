import { db } from '@/lib/prisma'
import {  DocumentType, DocumentStatus } from '@prisma/client'
import { DocumentWithMetadata } from '@/types/document'

export async function getProfileDocuments(profileId: string): Promise<DocumentWithMetadata[]> {
  return db.document.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getDocumentsByType(profileId: string, type: DocumentType) {
  return db.document.findFirst({
    where: {
      profileId,
      type,
      status: { not: DocumentStatus.REJECTED }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getDocumentStats(profileId: string) {
  const documents = await db.document.findMany({
    where: { profileId },
    select: { status: true }
  })

  return {
    total: documents.length,
    validated: documents.filter(d => d.status === DocumentStatus.VALIDATED).length,
    pending: documents.filter(d => d.status === DocumentStatus.PENDING).length,
    expired: documents.filter(d => d.status === DocumentStatus.EXPIRED).length
  }
}

export async function updateDocumentStatus(
  documentId: string,
  status: DocumentStatus,
  validationNotes?: string[]
) {
  return db.document.update({
    where: { id: documentId },
    data: {
      status,
      metadata: {
        update: {
          validationNotes
        }
      }
    }
  })
}