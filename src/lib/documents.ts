import { db } from '@/lib/prisma'
import { DocumentCreateInput, DocumentUpdateInput, DocumentStats } from '@/types/document'
import { differenceInDays, isPast } from 'date-fns'
import { DocumentStatus } from '@prisma/client'

export async function createDocument(input: DocumentCreateInput) {
  // Upload du fichier et création en DB
  const fileUrl = await uploadFile(input.file)

  return db.document.create({
    data: {
      type: input.type,
      fileUrl,
      fileName: input.file.name,
      fileSize: input.file.size,
      mimeType: input.file.type,
      userId: input.userId,
      requestId: input.requestId,
      validityPeriod: input.validityPeriod,
      isOriginal: input.isOriginal,
    }
  })
}

export async function updateDocument(id: string, input: DocumentUpdateInput) {
  return db.document.update({
    where: { id },
    data: input
  })
}

export async function getDocumentStats(userId: string): Promise<DocumentStats> {
  const documents = await db.document.findMany({
    where: { userId }
  })

  // Calculer les statistiques
  return {
    total: documents.length,
    byStatus: documents.reduce((acc, doc) => ({
      ...acc,
      [doc.status]: (acc[doc.status] || 0) + 1
    }), {} as Record<DocumentStatus, number>),
    byType: documents.reduce((acc, doc) => ({
      ...acc,
      [doc.type]: (acc[doc.type] || 0) + 1
    }), {} as Record<DocumentType, number>),
    expiringWithin30Days: documents.filter(doc => {
      if (!doc.validUntil) return false
      const daysUntilExpiry = differenceInDays(doc.validUntil, new Date())
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }).length,
    needsRenewal: documents.filter(doc => doc.needsRenewal).length
  }
}

export function isDocumentExpired(document: Document): boolean {
  if (!document.validUntil) return false
  return isPast(document.validUntil)
}

export function getDocumentValidityStatus(document: Document): DocumentStatus {
  if (isDocumentExpired(document)) return 'EXPIRED'
  if (!document.isVerified) return 'PENDING'
  return document.status
}