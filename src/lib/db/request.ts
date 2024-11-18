import { db } from '@/lib/prisma'
import type { ConsularRequestInput, RequestWithRelations, RequestFilters, PaginationParams, PaginatedResponse } from '@/types'
import { Prisma } from '@prisma/client'

export const requestIncludes = {
  user: {
    include: {
      profile: true
    }
  },
  consulate: true,
  messages: true,
  notes: true
} as const

export async function createRequest(
  userId: string,
  consulateId: string,
  data: ConsularRequestInput
): Promise<RequestWithRelations> {
  return db.request.create({
    data: {
      type: data.type,
      user: { connect: { id: userId } },
      consulate: { connect: { id: consulateId } },
    },
    include: requestIncludes
  })
}

export async function getRequestById(id: string): Promise<RequestWithRelations | null> {
  return db.request.findUnique({
    where: { id },
    include: requestIncludes
  })
}

export async function getRequests(
  filters: RequestFilters,
  pagination: PaginationParams
): Promise<PaginatedResponse<RequestWithRelations>> {
  const where: Prisma.RequestWhereInput = {
    ...(filters.status && { status: filters.status }),
    ...(filters.type && { type: filters.type }),
    ...(filters.consulateId && { consulateId: filters.consulateId }),
    ...(filters.dateRange && {
      createdAt: {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      }
    })
  }

  const [total, data] = await Promise.all([
    db.request.count({ where }),
    db.request.findMany({
      where,
      include: requestIncludes,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: pagination.orderBy ? {
        [pagination.orderBy]: pagination.orderDirection
      } : undefined
    })
  ])

  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit)
  }
}