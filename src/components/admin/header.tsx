import { Header } from "@/components/ui/header"
import { NavItem } from '@/components/layouts/types'

interface AdminHeaderProps {
  items?: NavItem[]
}

export async function AdminHeader({ items }: AdminHeaderProps) {
  return (
    <Header
      showMobileNav={true}
      items={items}
    />
  )
}