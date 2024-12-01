'use server'

import { db } from '@/lib/prisma'
import { ActionResult } from '@/lib/auth/action'
import { checkAuth } from '@/lib/auth/action'

export async function deleteProcedure(
  procedureId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN'])
    if (authResult.error) return { error: authResult.error }

    // Vérifier si la procédure existe
    const procedure = await db.procedure.findUnique({
      where: { id: procedureId },
      include: {
        requests: true
      }
    })

    if (!procedure) {
      return { error: 'Procedure not found' }
    }

    // Si des demandes sont en cours, on désactive la procédure au lieu de la supprimer
    if (procedure.requests.length > 0) {
      await db.procedure.update({
        where: { id: procedureId },
        data: { isActive: false }
      })
      return { data: { success: true } }
    }

    // Sinon, on peut supprimer complètement
    await db.procedure.delete({
      where: { id: procedureId }
    })

    return { data: { success: true } }
  } catch (error) {
    console.error('Error deleting procedure:', error)
    return { error: 'Failed to delete procedure' }
  }
}

export async function deleteProcedureRequest(
  requestId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const authResult = await checkAuth()
    if (authResult.error || !authResult.user) return { error: authResult.error }

    // Vérifier si la demande existe et appartient à l'utilisateur
    const request = await db.procedureRequest.findUnique({
      where: {
        id: requestId,
        userId: authResult.user.id
      }
    })

    if (!request) {
      return { error: 'Procedure request not found' }
    }

    // On ne peut supprimer que les demandes en brouillon
    if (request.status !== 'DRAFT') {
      return { error: 'Cannot delete submitted procedure request' }
    }

    // Supprimer la demande et ses relations
    await db.procedureRequest.delete({
      where: { id: requestId }
    })

    return { data: { success: true } }
  } catch (error) {
    console.error('Error deleting procedure request:', error)
    return { error: 'Failed to delete procedure request' }
  }
}