import type { ProfileInput, UserWithRelations } from '@/types'
import {db} from '@/lib/prisma'

export const userIncludes = {
  profile: {
    include: {
      address: true,
    },
  },
  consulate: {
    include: {
      address: true,
      countries: true,
    },
  },
  requests: true,
  messages: true,
  notifications: true,
} as const

export async function getUserById(id: string): Promise<UserWithRelations | null> {
  return db.user.findUnique({
    where: { id },
    include: userIncludes,
  })
}

export async function getUserByEmail(email: string): Promise<UserWithRelations | null> {
  return db.user.findUnique({
    where: { email },
    include: userIncludes,
  })
}

export async function createUserProfile(
  userId: string,
  profileData: ProfileInput
): Promise<UserWithRelations> {
  const { address, ...profile } = profileData

  return db.user.update({
    where: { id: userId },
    data: {
      profile: {
        create: {
          ...profile,
          address: address ? {
            create: address
          } : undefined
        }
      }
    },
    include: userIncludes
  })
}

export async function updateUserProfile(
  userId: string,
  profileData: Partial<ProfileInput>
): Promise<UserWithRelations> {
  const { address, ...profile } = profileData

  return db.user.update({
    where: { id: userId },
    data: {
      profile: {
        update: {
          ...profile,
          address: address ? {
            upsert: {
              create: address,
              update: address
            }
          } : undefined
        }
      }
    },
    include: userIncludes
  })
}