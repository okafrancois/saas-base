import {
  calculateDocumentsStats,
  calculateProceduresStats,
  calculateProfileCompletion,
  getMissingFields,
  getProfileStatus,
} from '@/lib/services/dashboard/utils'
import { db } from '@/lib/prisma'

export async function getDashboardStats(userId: string) {
  try {
    const [
      profile,
      documents,
      requests,
      appointments
    ] = await Promise.all([
      // Récupérer le profil
      db.profile.findUnique({
        where: { userId },
        include: {
          address: true,
          emergencyContact: true,
          addressInGabon: true
        }
      }),

      // Récupérer les documents
      db.document.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      }),

      // Récupérer les demandes
      db.request.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),

      // Récupérer les rendez-vous - Mise à jour de la requête
      db.appointment.findMany({
        where: {
          userId,
          date: { gte: new Date() }
        },
        select: {
          id: true,
          type: true,
          status: true,
          date: true,
          description: true,
          createdAt: true
        },
        orderBy: { date: 'asc' },
        take: 1
      })
    ])

    // Calculer les statistiques des rendez-vous
    const appointmentStats = {
      upcoming: appointments[0] ? {
        id: appointments[0].id,
        date: appointments[0].date,
        type: appointments[0].type,
        status: appointments[0].status
      } : undefined,
      past: 0, // Nous devrons faire une requête séparée pour cela
      cancelled: 0 // Nous devrons faire une requête séparée pour cela
    }

    // Si nous voulons les statistiques complètes des rendez-vous
    if (appointments.length > 0) {
      const [pastCount, cancelledCount] = await Promise.all([
        db.appointment.count({
          where: {
            userId,
            date: { lt: new Date() }
          }
        }),
        db.appointment.count({
          where: {
            userId,
            status: 'CANCELLED'
          }
        })
      ])

      appointmentStats.past = pastCount
      appointmentStats.cancelled = cancelledCount
    }

    return {
      profile: {
        completionRate: calculateProfileCompletion(profile),
        lastUpdate: profile?.updatedAt ?? new Date(),
        missingFields: getMissingFields(profile),
        status: getProfileStatus(profile)
      },
      requests: {
        total: requests.length,
        pending: requests.filter(r => r.status === 'PENDING').length,
        inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
        completed: requests.filter(r => r.status === 'COMPLETED').length,
        latestRequest: requests[0] ? {
          id: requests[0].id,
          type: requests[0].type,
          status: requests[0].status,
          updatedAt: requests[0].updatedAt
        } : undefined
      },
      procedures: calculateProceduresStats(requests),
      appointments: appointmentStats,
      documents: calculateDocumentsStats(documents)
    }

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw new Error('Failed to fetch dashboard statistics')
  }
}