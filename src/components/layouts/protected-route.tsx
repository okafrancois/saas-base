"use client"

import { useCurrentUser } from "@/hooks/use-current-user"
import { UserRole } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PAGE_ROUTES } from "@/schemas/app-routes"

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: UserRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const user = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push(PAGE_ROUTES.login)
      return
    }

    if (roles && !roles.includes(user.role)) {
      router.push(PAGE_ROUTES.unauthorized)
    }
  }, [user, roles, router])

  if (!user) {
    return null
  }

  if (roles && !roles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}