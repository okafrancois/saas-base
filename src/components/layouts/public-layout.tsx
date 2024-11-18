import { PublicHeader } from "../public/header"
import { PublicFooter } from "../public/footer"
import { LayoutProps } from '@/components/layouts/types'

export function PublicLayout({ children }: LayoutProps) {
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