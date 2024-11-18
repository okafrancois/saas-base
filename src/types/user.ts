import { Prisma, UserRole } from '@prisma/client'
import type { ConsulateWithRelations } from './consulate'

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    profile: true
    consulate: true
    requests: true
    messages: true
    notifications: true
  }
}>

export interface AuthContext {
  user: UserWithRelations | null
  role: UserRole
  consulate?: ConsulateWithRelations
}