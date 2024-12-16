import { PrismaClient } from '@prisma/client'

// Gestion de plusieurs instances de Prisma en mode développement
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Active les logs des requêtes pour debug
  })

// Prévention de multiples instanciations dans un environnement de développement
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}