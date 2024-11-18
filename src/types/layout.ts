import { UserRole } from "@prisma/client"

export interface BaseLayoutProps {
  children: React.ReactNode
}

export interface ProtectedLayoutProps extends BaseLayoutProps {
  roles?: UserRole[]
}