import { db } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PAGE_ROUTES } from '@/schemas/app-routes'

export async function handleDashboardAction(
  section: string,
  action: string,
  userId: string
) {
  try {
    switch (section) {
      case 'profile':
        return await handleProfileAction(action, userId)
      case 'requests':
        return await handleRequestAction(action, userId)
      case 'procedures':
        return await handleProcedureAction(action, userId)
      case 'appointments':
        return await handleAppointmentAction(action, userId)
      case 'documents':
        return await handleDocumentAction(action, userId)
      default:
        throw new Error('Invalid section')
    }
  } catch (error) {
    console.error(`Error handling dashboard action: ${section}/${action}`, error)
    throw error
  }
}

async function handleProfileAction(action: string, userId: string) {
  switch (action) {
    case 'view_profile':
      redirect(PAGE_ROUTES.profile)
    case 'complete_profile':
      redirect(PAGE_ROUTES.profile + '/edit')
    case 'update_profile':
      redirect(PAGE_ROUTES.profile + '/edit')
    default:
      throw new Error('Invalid profile action')
  }
}

async function handleRequestAction(action: string, userId: string) {
  switch (action) {
    case 'new_request':
      redirect(PAGE_ROUTES.requests + '/new')
    case 'view_request':
      // Récupérer la dernière demande
      const latestRequest = await db.request.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
      redirect(PAGE_ROUTES.requests + `/${latestRequest?.id}`)
    default:
      throw new Error('Invalid request action')
  }
}

async function handleProcedureAction(action: string, userId: string) {
  switch (action) {
    case 'view_procedure':
      const activeProcedure = await db.request.findFirst({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        orderBy: { updatedAt: 'desc' }
      })
      redirect(PAGE_ROUTES.requests + `/${activeProcedure?.id}/procedure`)
    default:
      throw new Error('Invalid procedure action')
  }
}

async function handleAppointmentAction(action: string, userId: string) {
  switch (action) {
    case 'schedule_appointment':
      redirect(PAGE_ROUTES.appointments + '/schedule')
    case 'reschedule_appointment':
      const appointment = await db.appointment.findFirst({
        where: {
          userId,
          date: { gte: new Date() }
        },
        orderBy: { date: 'asc' }
      })
      redirect(PAGE_ROUTES.appointments + `/${appointment?.id}/reschedule`)
    case 'cancel_appointment':
      // Implémenter la logique d'annulation
      break
    default:
      throw new Error('Invalid appointment action')
  }
}

async function handleDocumentAction(action: string, userId: string) {
  switch (action) {
    case 'upload_document':
      redirect(PAGE_ROUTES.documents + '/upload')
    case 'view_document':
      const latestDocument = await db.document.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
      redirect(PAGE_ROUTES.documents + `/${latestDocument?.id}`)
    default:
      throw new Error('Invalid document action')
  }
}