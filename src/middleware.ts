import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_AUTH_REDIRECT,
  publicRoutes,
} from '@/routes'
import { PAGE_ROUTES } from '@/schemas/app-routes'

const { auth } = NextAuth(authConfig)
export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.includes(`${route}`)
  )
  const isPublicRoute = publicRoutes.some((route) =>
    {
      if (route === PAGE_ROUTES.base) {
        return nextUrl.pathname === route
      }

      return nextUrl.pathname.includes(`${route}`)
    }
  )

  if (isPublicRoute) {
    return
  }

  if (isApiAuthRoute) {
    return
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_AUTH_REDIRECT, nextUrl))
    }

    return
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)

    return Response.redirect(new URL(
      `/auth/login?callbackUrl=${encodedCallbackUrl}`,
      nextUrl,
    ))
  }
})
// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}