// src/actions/dashboard.ts
'use server'

import { db } from '@/lib/prisma'
import { DashboardData } from '@/types/dashboard'
import { getCurrentUser } from '@/actions/user'

export async function getDashboardData(): Promise<DashboardData> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const [profile, documents, requests] = await Promise.all([
    db.profile.findUnique({
      where: { userId: user.id },
      include: { /* inclusions nécessaires */ }
    }),
    db.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    db.request.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  // Calcul des statistiques
  const stats = calculateStats({ profile, documents, requests })

  return {
    profile: {
      ...profile,
      completionRate: calculateProfileCompletionRate(profile)
    },
    documents: {
      valid: documents.filter(d => /* logique de validation */).length,
      expired: documents.filter(d => /* logique d'expiration */).length,
      pending: documents.filter(d => d.status === 'PENDING').length,
      recent: documents
    },
    requests: {
      active: requests.filter(r => r.status === 'PENDING').length,
      completed: requests.filter(r => ['APPROVED', 'REJECTED'].includes(r.status)).length,
      recent: requests
    }
  }
}