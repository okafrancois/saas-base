import { db } from '@/lib/prisma'

export async function getUserDocuments(userId: string) {
  return db.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getDocumentStats(userId: string) {
  const documents = await db.document.findMany({
    where: { userId },
    select: { status: true }
  })

  return {
    total: documents.length,
    validated: documents.filter(d => d.status === 'VALIDATED').length,
    pending: documents.filter(d => d.status === 'PENDING').length,
    expired: documents.filter(d => d.status === 'EXPIRED').length
  }
}