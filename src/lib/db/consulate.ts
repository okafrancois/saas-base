import { db } from '@/lib/prisma'
import type { ConsulateWithRelations, ConsulateStats, AddressInput } from '@/types'

export const consulateIncludes = {
  users: {
    include: {
      profile: true
    }
  },
  countries: true,
  requests: true,
  address: true
} as const

export async function getConsulateById(id: string): Promise<ConsulateWithRelations | null> {
  return db.consulate.findUnique({
    where: { id },
    include: consulateIncludes
  })
}

export async function createConsulate(data: {
  name: string
  email: string
  phone: string
  address: AddressInput
  website?: string
  isGeneral: boolean
  countries: { name: string; code: string }[]
}) {
  return db.consulate.create({
    data: {
      ...data,
      address: {
        create: data.address
      },
      countries: {
        create: data.countries
      }
    },
    include: consulateIncludes
  })
}

export async function getConsulateStats(consulateId: string): Promise<ConsulateStats> {
  const [
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    requestsByType
  ] = await Promise.all([
    db.request.count({ where: { consulateId } }),
    db.request.count({ where: { consulateId, status: 'PENDING' } }),
    db.request.count({ where: { consulateId, status: 'APPROVED' } }),
    db.request.count({ where: { consulateId, status: 'REJECTED' } }),
    db.request.groupBy({
      by: ['type'],
      where: { consulateId },
      _count: true
    })
  ])

  // Calculer le temps moyen de traitement
  const requests = await db.request.findMany({
    where: {
      consulateId,
      status: { in: ['APPROVED', 'REJECTED'] }
    },
    select: {
      createdAt: true,
      updatedAt: true
    }
  })

  const averageProcessingTime = requests.reduce((acc, req) => {
    return acc + (req.updatedAt.getTime() - req.createdAt.getTime())
  }, 0) / (requests.length || 1)

  return {
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    averageProcessingTime,
    requestsByType: requestsByType.reduce((acc, { type, _count }) => ({
      ...acc,
      [type]: _count
    }), {} as Record<string, number>)
  }
}