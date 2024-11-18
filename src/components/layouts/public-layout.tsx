import { PublicHeader } from "@/components/public/header"
import { PublicFooter } from "@/components/public/footer"
import { BaseLayoutProps } from "@/types/layout"

export function PublicLayout({ children }: BaseLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-screen overflow-hidden">
      <PublicHeader />

      <main className={"flex h-full w-full grow"}>
        {children}
      </main>

      <PublicFooter />
    </div>
  )
}