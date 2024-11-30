import {
  calculateDocumentsStats,
  calculateProceduresStats,
  calculateProfileCompletion,
  getMissingFields,
  getProfileStatus,
} from '@/lib/services/dashboard/utils'
import { db } from '@/lib/prisma'
import { AppointmentStatus } from '@prisma/client'

export async function getDashboardStats(userId: string) {
  try {
    const [
      profile,
      requests
    ] = await Promise.all([
      // Récupérer le profil
      db.profile.findUnique({
        where: { userId },
        include: {
          address: true,
          emergencyContact: true,
          addressInGabon: true,
          documents: {
            orderBy: { updatedAt: 'desc' }
          },
          appointments: {
            where: {
              date: { gte: new Date() }
            },
            orderBy: { date: 'asc' },
            take: 1
          },
        }
      }),

      // Récupérer les demandes
      db.request.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
    ])

    // Calculer les statistiques des rendez-vous
    const appointmentStats = {
      upcoming: profile?.appointments[0] ? {
        id: profile?.appointments[0].id,
        date: profile?.appointments[0].date,
        type: profile?.appointments[0].type,
        status: profile?.appointments[0].status
      } : undefined,
      past: 0, // Nous devrons faire une requête séparée pour cela
      cancelled: 0 // Nous devrons faire une requête séparée pour cela
    }

    // Si nous voulons les statistiques complètes des rendez-vous
    if (profile?.appointments && profile.appointments.length > 0) {
      appointmentStats.past = profile.appointments.filter(a => a.date < new Date()).length
      appointmentStats.cancelled = profile.appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length
    }

    return {
      profile: {
        completionRate: calculateProfileCompletion(profile),
        lastUpdate: profile?.updatedAt ?? new Date(),
        missingFields: getMissingFields(profile),
        status: profile?.status ?? 'INCOMPLETE',
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
      documents: calculateDocumentsStats(profile?.documents ?? [])
    }

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw new Error('Failed to fetch dashboard statistics')
  }
}