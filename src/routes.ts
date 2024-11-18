import {
  API_ROUTES,
  ApiRoute,
  PAGE_ROUTES,
  PageRoute,
} from '@/schemas/app-routes'
import { Route } from 'next'
import { UserRole } from '@prisma/client'

/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {PAGE_ROUTES[]}
 */
export const publicRoutes: PageRoute[] | ApiRoute[] = [
  PAGE_ROUTES.base
]

/**
 * A, array of routes that are used for authentication
 * These routes will redirect to the user settings page if the user is already authenticated
 * @type {PageRoute[]}
 */
export const authRoutes: PageRoute[] = [
  PAGE_ROUTES.login,
]

/**
 * The base prefix for the api authentication routes
 * Routes that start with this prefix ase used for authentication
 * @type {ApiRoute}
 */
export const apiAuthPrefix: ApiRoute = API_ROUTES.base_auth

/**
 * The default redirect route for authenticated users
 * Routes that start with this prefix are used for api routes
 * @type {PageRoute}
 */
export const DEFAULT_AUTH_REDIRECT: Route = PAGE_ROUTES.base

export const roleRoutes = [
  {
    path: PAGE_ROUTES.admin,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
  },
  {
    path: PAGE_ROUTES.dashboard,
    roles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.RESPONSIBLE]
  },
]