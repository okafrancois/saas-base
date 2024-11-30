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

  // Pages d'authentification
  login: '/auth/login' as Route<string>,
  auth_error: '/auth/error' as Route<string>,

  // Pages utilisateur
  profile: '/profile' as Route<string>,
  profile_edit: '/profile/edit' as Route<string>,
  settings: '/settings' as Route<string>,
  requests: '/requests' as Route<string>,
  documents: '/documents' as Route<string>,
  procedures: '/procedures' as Route<string>,
  procedure: '/procedures/:id' as Route<string>,
  procedure_edit: (id: string) => `/procedures/${id.toLowerCase()}/edit` as Route<string>,
  procedure_start: (id: string) => `/procedures/${id.toLowerCase()}/start` as Route<string>,

  // Pages admin
  admin: '/admin' as Route<string>,
  admin_dashboard: '/admin' as Route<string>,
  admin_users: '/admin/users' as Route<string>,
  admin_requests: '/admin/requests' as Route<string>,
  admin_settings: '/admin/settings' as Route<string>,

  // Pages partagées
  dashboard: '/dashboard' as Route<string>,
  help: '/help' as Route<string>,
  feedback: '/feedback' as Route<string>,
  appointments: '/appointments' as Route<string>,

  // Pages publiques
  registration: '/registration' as Route<string>,
  unauthorized: '/unauthorized' as Route<string>,
  consular_registration: '/consular-registration' as Route<string>,
  privacy_policy: '#' as Route<string>,
  terms: '#' as Route<string>,
} as const

export type PageRoute = (typeof PAGE_ROUTES)[keyof typeof PAGE_ROUTES]