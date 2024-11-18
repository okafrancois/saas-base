
import { UserNav } from "./user-nav"
import { MobileNav } from "./mobile-nav"
import { NavItem } from '@/components/layouts/types'

interface HeaderProps {
  showMobileNav?: boolean
  items?: NavItem[]
}

export async function Header({ showMobileNav = true, items }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {showMobileNav && <MobileNav items={items} />}
          <div className="flex-1" />
          <UserNav />
        </div>
      </div>
    </header>
  )
}