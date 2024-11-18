import { PAGE_ROUTES } from '@/schemas/app-routes'
import { UserRole } from '@prisma/client'

export const publicRoutes = [
  PAGE_ROUTES.base,
  PAGE_ROUTES.privacy_policy,
  PAGE_ROUTES.terms,
  PAGE_ROUTES.registration,
] as const

export const authRoutes = [
  PAGE_ROUTES.login,
  PAGE_ROUTES.auth_error,
] as const

export const apiAuthPrefix = '/api/auth'

export const DEFAULT_AUTH_REDIRECT = PAGE_ROUTES.dashboard

export const roleRoutes = [
  {
    path: PAGE_ROUTES.admin,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
  },
  {
    path: PAGE_ROUTES.dashboard,
    roles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]
  }
] as const