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
  register: '/auth/register' as Route<string>,
  login: '/auth/login' as Route<string>,
  password_reset: '/auth/password-reset' as Route<string>,
  auth_error: '/auth/error' as Route<string>,
  user_settings: '/user-settings' as Route<string>,
  user_settings_account: '/user-settings/account' as Route<string>,
  user_settings_profile: '/user-settings/profile' as Route<string>,
  user_settings_appearance: '/user-settings/appearance' as Route<string>,
  profiles: '/view' as Route<string>,
  single_profile: '/view/:id' as Route<string>,
  consulates: '/consulates' as Route<string>,
  consulate_dashboard: (id: string) => `/consulates/${id}/dashboard` as Route<string>,
  new_company: '/consulates/new' as Route<string>,
  view: '/view' as Route<string>,
  listing: '/directory' as Route<string>,
  home: '/home' as Route<string>,
  admin: '/admin' as Route<string>,
  my_profile: '/my-profile' as Route<string>,
  consular_steps: '/consular-steps' as Route<string>,
  notifications: '/notifications' as Route<string>,
  notifications_create: '/notifications/create' as Route<string>,
  messages: '/messages' as Route<string>,
  dashboard: '/dashboard' as Route<string>,
  new_profile: '/new-profile' as Route,
  consular_registration: '/consular-registration' as Route<string>,
} as const

export type PageRoute = (typeof PAGE_ROUTES)[keyof typeof PAGE_ROUTES]