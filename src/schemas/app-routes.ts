import { Route } from 'next'

export const API_ROUTES = {
  base: '/api' as Route<string>,
  base_auth: '/api/auth' as Route<string>,
  register_api: '/api/auth/register' as Route<string>,
  login_api: '/api/auth/login' as Route<string>,
} as const

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES]

export const PAGE_ROUTES = {
  base: '/' as Route<string>,
  login: '/auth/login' as Route<string>,
  auth_error: '/auth/error' as Route<string>,
  dashboard: '/dashboard' as Route<string>,
  unauthorized: '/unauthorized' as Route<string>,
  admin: '/admin' as Route<string>,
  consular_registration: '/consular-registration' as Route<string>,
  privacy_policy: '#' as Route<string>,
  terms: '#' as Route<string>,
} as const

export type PageRoute = (typeof PAGE_ROUTES)[keyof typeof PAGE_ROUTES]