import { Route } from 'next'

export const API_ROUTES = {
  base: '/api' as Route<string>,
  base_auth: '/api/auth' as Route<string>,
  register_api: '/api/auth/register' as Route<string>,
  login_api: '/api/auth/login' as Route<string>,
} as const

export const ROUTES = {
  base: '/' as Route<string>,

  // Pages d'authentification
  login: '/auth/login' as Route<string>,
  auth_error: '/auth/error' as Route<string>,

  settings: '/settings' as Route<string>,

  privacy_policy: '#' as Route<string>,
  terms: '#' as Route<string>,
  unauthorized: '/unauthorized' as Route<string>,
} as const

export type PageRoute = (typeof ROUTES)[keyof typeof ROUTES]