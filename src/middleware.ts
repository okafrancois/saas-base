import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_AUTH_REDIRECT,
  publicRoutes, roleRoutes,
} from '@/routes'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role || UserRole.USER
  const nonce = nanoid()
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  console.log({
    nextUrl,
    isLoggedIn,
    userRole,
    nonce,
  })

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.includes(`${route}`)
  )
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === PAGE_ROUTES.base) {
      return nextUrl.pathname === route
    }
    return nextUrl.pathname.includes(`${route}`)
  })

  if (isPublicRoute) {
    return
  }

  // Vérification des routes protégées par rôle
  const isRoleProtectedRoute = roleRoutes.some(route => {
    if (nextUrl.pathname.startsWith(route.path)) {
      return !route.roles.includes(userRole)
    }
    return false
  })

  console.log({
    isApiAuthRoute,
    isAuthRoute,
    isPublicRoute,
    isRoleProtectedRoute
  })

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return Response.redirect(
      new URL(`${PAGE_ROUTES.login}?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    )
  }

  // Si la route nécessite un rôle spécifique et l'utilisateur n'a pas le bon rôle
  if (isRoleProtectedRoute) {
    return Response.redirect(new URL(PAGE_ROUTES.unauthorized, nextUrl))
  }

  console.log({
    isRoleProtectedRoute
  })

  if (isApiAuthRoute) {
    return
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_AUTH_REDIRECT, nextUrl))
    }
    return
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}