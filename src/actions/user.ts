'use server'

import { getUserById } from '@/lib/user'
import { DeleteUserInput, DeleteUserSchema } from '@/schemas'
import { db } from '@/lib/prisma'
import { auth } from '@/auth'
import { UserRole } from '@prisma/client'

export const getCurrentUser = async () => {
  const session = await auth()

  return session?.user
}

export const getCurrentUserOrThrow = async () => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    throw new Error('User not found')
  }

  return currentUser
}

export const isUserExists = async (id: string) => {
  const user = await getUserById(id)

  return !!user
}

export const deleteUser = async (values: DeleteUserInput) => {
  const user = await getCurrentUserOrThrow()

  if (user.role !== UserRole.ADMIN) {
    throw new Error('User not authorized')
  }

  const validValues = DeleteUserSchema.safeParse(values)

  if (!validValues.success) {
    throw new Error('Invalid values')
  }

  const { id } = validValues.data

  try {
    await db.user.delete({
      where: {
        id,
      },
    })

    return {
      success: 'User deleted',
    }
  } catch (error) {
    return {
      error: 'User not found',
    }
  }
}

export const searchProfile = async (query: string) => {
  return db.profile.findMany({
    where: {
      OR: [
        {
          firstName: {
            contains: query,
          },
        },
        {
          lastName: {
            contains: query,
          },
        },
      ],
    },
  })
}