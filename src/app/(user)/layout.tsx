import { UserLayout } from "@/components/layouts/user-layout"

export default function UserRootLayout({
                                         children,
                                       }: {
  children: React.ReactNode
}) {
  return <UserLayout>{children}</UserLayout>
}