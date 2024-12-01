'use server'

import { db } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth/action'
import { ProcedureStatus, ProcedureType } from '@prisma/client'

export async function getAvailableProcedures(type?: ProcedureType) {
  try {
    const authResult = await checkAuth()
    if (authResult.error) return { error: authResult.error }

    const where = {
      isActive: true,
      ...(type && { type })
    }

    return await db.procedure.findMany({
      where,
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching procedures:', error)
    throw new Error('Failed to fetch procedures')
  }
}

export async function getUserProcedureRequests(status?: ProcedureStatus) {
  try {
    const authResult = await checkAuth()
    if (authResult.error || !authResult.user) return { error: authResult.error }

    const where = {
      userId: authResult.user.id,
      ...(status && { status })
    }

    return await db.procedureRequest.findMany({
      where,
      include: {
        procedure: true,
        documents: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching user requests:', error)
    throw new Error('Failed to fetch user requests')
  }
}

export async function getProcedureRequest(requestId: string) {
  try {
    const authResult = await checkAuth()
    if (authResult.error || !authResult.user) return { error: authResult.error }

    const request = await db.procedureRequest.findUnique({
      where: {
        id: requestId,
        userId: authResult.user.id
      },
      include: {
        procedure: {
          include: {
            steps: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        documents: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        notes: authResult.user.role === 'ADMIN' || authResult.user.role === 'SUPER_ADMIN'
      }
    })

    if (!request) {
      throw new Error('Procedure request not found')
    }

    return request
  } catch (error) {
    console.error('Error fetching procedure request:', error)
    throw new Error('Failed to fetch procedure request')
  }
}