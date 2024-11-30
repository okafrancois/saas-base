import { db } from '@/lib/prisma'
import { AVAILABLE_PROCEDURES } from './config'
import { ConsularProcedure } from '@/types/procedure'
import { RequestStatus, RequestType } from '@prisma/client'

export async function getUserProcedures(userId: string): Promise<ConsularProcedure[]> {
  try {
    // Récupérer les demandes existantes de l'utilisateur
    const existingRequests = await db.request.findMany({
      where: {
        userId,
        status: {
          notIn: [RequestStatus.COMPLETED, RequestStatus.REJECTED]
        }
      },
      select: {
        type: true,
        status: true
      }
    })

    // Récupérer le profil de l'utilisateur pour vérifier son éligibilité
    const profile = await db.profile.findFirst({
      where: { userId },
      select: {
        status: true,
        nationality: true,
        // Ajouter d'autres champs pertinents pour vérifier l'éligibilité
      }
    })

    // Filtrer les procédures disponibles en fonction du profil et des demandes existantes
    return AVAILABLE_PROCEDURES.filter(procedure => {
      // Vérifier si une demande est déjà en cours pour cette procédure
      const existingRequest = existingRequests.find(req => req.type === procedure.id)
      if (existingRequest) return false

      // Vérifier l'éligibilité en fonction du profil
      // Par exemple, certaines démarches peuvent nécessiter un profil validé
      if (procedure.id === RequestType.PASSPORT_REQUEST && profile?.status !== RequestStatus.VALIDATED) {
        return false
      }

      return true
    }).map(procedure => ({
      ...procedure,
      // Ajouter des métadonnées supplémentaires si nécessaire
      // Par exemple, le statut d'éligibilité, les alertes, etc.
    }))
  } catch (error) {
    console.error('Error fetching user procedures:', error)
    return []
  }
}

// Pour la gestion d'une procédure spécifique
export async function getUserProcedure(userId: string, procedureId: string) {
  try {
    // Vérifier si une demande existe déjà
    const existingRequest = await db.request.findFirst({
      where: {
        userId,
        type: procedureId as RequestType,
        status: {
          notIn: [RequestStatus.COMPLETED, RequestStatus.REJECTED]
        }
      }
    })

    if (existingRequest) {
      throw new Error('Une demande est déjà en cours pour cette procédure')
    }

    const procedure = AVAILABLE_PROCEDURES.find(p => p.id === procedureId)
    if (!procedure) {
      throw new Error('Procédure non trouvée')
    }

    // Vérifier l'éligibilité
    const profile = await db.profile.findFirst({
      where: { userId },
      include: {
        documents: true,
        // Inclure d'autres relations nécessaires
      }
    })

    // Vérifier les conditions spécifiques à la procédure
    if (procedure.id === RequestType.PASSPORT_REQUEST && profile?.status !== RequestStatus.VALIDATED) {
      throw new Error('Votre profil doit être validé pour cette démarche')
    }

    return {
      procedure,
      profile,
      canStart: true
    }
  } catch (error) {
    console.error('Error fetching procedure:', error)
    throw error
  }
}

// Pour suivre l'avancement d'une procédure
export async function getProcedureProgress(userId: string, requestId: string) {
  try {
    const request = await db.request.findFirst({
      where: {
        id: requestId,
        userId
      },
      include: {
        messages: true,
        // Inclure d'autres relations nécessaires pour suivre l'avancement
      }
    })

    if (!request) {
      throw new Error('Demande non trouvée')
    }

    return {
      request,
      // Calculer le pourcentage de progression
      progress: calculateProcedureProgress(request),
      // Déterminer la prochaine étape
      nextStep: determineNextStep(request)
    }
  } catch (error) {
    console.error('Error fetching procedure progress:', error)
    throw error
  }
}

// Fonction utilitaire pour calculer la progression
function calculateProcedureProgress(request: any) {
  // Logique de calcul de la progression
  // À adapter selon les étapes de chaque type de procédure
  const progressMap = {
    'DRAFT': 0,
    'SUBMITTED': 25,
    'IN_REVIEW': 50,
    'ADDITIONAL_INFO_NEEDED': 75,
    'APPROVED': 90,
    'COMPLETED': 100
  } as Record<string, number>

  return progressMap[request.status] || 0
}

// Fonction utilitaire pour déterminer la prochaine étape
function determineNextStep(request: any) {
  // Logique pour déterminer la prochaine étape
  // À adapter selon le type de procédure et son état actuel
  const nextStepMap = {
    'DRAFT': 'Soumettre la demande',
    'SUBMITTED': 'En attente de validation',
    'IN_REVIEW': 'En cours d\'examen',
    'ADDITIONAL_INFO_NEEDED': 'Fournir les informations complémentaires',
    'APPROVED': 'Finaliser la procédure'
  } as Record<string, string>

  return nextStepMap[request.status] || ''
}