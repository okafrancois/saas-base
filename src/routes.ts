import {
  API_ROUTES,
  ApiRoute,
  PAGE_ROUTES,
  PageRoute,
} from '@/schemas/app-routes'
import { Route } from 'next'

/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {PAGE_ROUTES[]}
 */
export const publicRoutes: PageRoute[] | ApiRoute[] = [
  PAGE_ROUTES.view,
  PAGE_ROUTES.home,
  PAGE_ROUTES.profiles,
  PAGE_ROUTES.new_profile,
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