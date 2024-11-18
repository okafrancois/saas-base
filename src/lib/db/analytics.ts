import { db } from '@/lib/prisma'

export async function getSystemStats() {
  const [
    totalUsers,
    totalRequests,
    totalConsulates,
    recentActivity
  ] = await Promise.all([
    db.user.count(),
    db.request.count(),
    db.consulate.count(),
    db.request.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        consulate: true
      }
    })
  ])

  return {
    totalUsers,
    totalRequests,
    totalConsulates,
    recentActivity
  }
}

export async function getRequestTrends(days: number) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return db.request.groupBy({
    by: ['createdAt', 'status'],
    where: {
      createdAt: {
        gte: startDate
      }
    },
    _count: true
  })
}