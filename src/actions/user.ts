'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export const getCurrentUser = async () => {
  const session = await auth()

  return session?.user
}

export const checkUserExist = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  return !!user
}