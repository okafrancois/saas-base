'use server'

import { db } from '@/lib/prisma'
import { ProcedureType, DocumentType } from '@prisma/client'
import { ActionResult } from '@/lib/auth/action'
import { checkAuth } from '@/lib/auth/action'

interface CreateProcedureInput {
  type: ProcedureType
  title: string
  description?: string
  requiredDocuments: DocumentType[]
  optionalDocuments?: DocumentType[]
  estimatedTime?: string
  price?: number
  steps: {
    order: number
    title: string
    description?: string
    isRequired: boolean
    fields?: Record<string, unknown>
  }[]
}

export async function createProcedure(
  input: CreateProcedureInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN'])
    if (authResult.error) return { error: authResult.error }

    const procedure = await db.procedure.create({
      data: {
        type: input.type,
        title: input.title,
        description: input.description,
        requiredDocuments: input.requiredDocuments,
        optionalDocuments: input.optionalDocuments,
        estimatedTime: input.estimatedTime,
        price: input.price,
        steps: {
          create: input.steps.map(step => ({
            order: step.order,
            title: step.title,
            description: step.description,
            isRequired: step.isRequired,
            fields: step.fields ? JSON.stringify(step.fields) : undefined
          }))
        }
      }
    })

    return { data: { id: procedure.id } }
  } catch (error) {
    console.error('Error creating procedure:', error)
    return { error: 'Failed to create procedure' }
  }
}

export async function createProcedureRequest(
  procedureId: string,
  consulateId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const authResult = await checkAuth()
    if (authResult.error || !authResult.user) return { error: authResult.error }

    const request = await db.procedureRequest.create({
      data: {
        procedureId,
        userId: authResult.user.id,
        consulateId,
      }
    })

    return { data: { id: request.id } }
  } catch (error) {
    console.error('Error creating procedure request:', error)
    return { error: 'Failed to create procedure request' }
  }
}