import { PublicHeader } from "@/components/public/header"
import { PublicFooter } from "@/components/public/footer"
import { BaseLayoutProps } from "@/types/layout"

export function PublicLayout({ children }: BaseLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {children}
      </main>

      <PublicFooter />
    </div>
  )
}