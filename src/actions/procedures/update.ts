'use server'

import { db } from '@/lib/prisma'
import { ActionResult } from '@/lib/auth/action'
import { checkAuth } from '@/lib/auth/action'
import { ProcedureStatus, Prisma } from '@prisma/client'

interface UpdateProcedureRequestInput {
  requestId: string
  status?: ProcedureStatus
  formData?: Record<string, unknown>
}

function validateJsonData(data: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue;
}

export async function updateProcedureRequest(
  input: UpdateProcedureRequestInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const authResult = await checkAuth()
    if (authResult.error || !authResult.user) return { error: authResult.error }

    const request = await db.procedureRequest.findUnique({
      where: {
        id: input.requestId,
        userId: authResult.user.id
      }
    })

    if (!request) {
      return { error: 'Procedure request not found' }
    }

    // Convertir formData en Prisma.JsonValue
    const formDataJson = input.formData ? validateJsonData(input.formData) : undefined;

    const updatedRequest = await db.procedureRequest.update({
      where: {
        id: input.requestId
      },
      data: {
        status: input.status,
        formData: formDataJson as Prisma.InputJsonValue | undefined,
        ...(input.status === 'SUBMITTED' && {
          submittedAt: new Date()
        }),
        ...(input.status === 'COMPLETED' && {
          completedAt: new Date()
        })
      }
    })

    return { data: { id: updatedRequest.id } }
  } catch (error) {
    console.error('Error updating procedure request:', error)
    return { error: 'Failed to update procedure request' }
  }
}

export async function addProcedureRequestNote(
  requestId: string,
  content: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN'])
    if (authResult.error) return { error: authResult.error }

    const note = await db.note.create({
      data: {
        content,
        requestId
      }
    })

    return { data: { id: note.id } }
  } catch (error) {
    console.error('Error adding note:', error)
    return { error: 'Failed to add note' }
  }
}