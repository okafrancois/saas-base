import { db } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { UserWithRelations, PaginationParams, PaginatedResponse } from '@/types'
import { userIncludes } from './user'

export async function searchUsers(
  query: string,
  pagination: PaginationParams
): Promise<PaginatedResponse<UserWithRelations>> {
  const where: Prisma.UserWhereInput = {
    OR: [
      {
        email: {
          contains: query,
          mode: 'insensitive' as Prisma.QueryMode
        }
      },
      {
        name: {
          contains: query,
          mode: 'insensitive' as Prisma.QueryMode
        }
      },
      {
        phone: {
          contains: query
        }
      },
      {
        profile: {
          OR: [
            {
              firstName: {
                contains: query,
                mode: 'insensitive' as Prisma.QueryMode
              }
            },
            {
              lastName: {
                contains: query,
                mode: 'insensitive' as Prisma.QueryMode
              }
            }
          ]
        }
      }
    ]
  }

  const [total, data] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      include: userIncludes, // Utiliser les mêmes includes que dans user.ts
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