import { Header } from "@/components/ui/header"
import { NavItem } from '@/components/layouts/types'

interface UserHeaderProps {
  items?: NavItem[]
}

export async function UserHeader({ items }: UserHeaderProps) {
  return (
    <Header
      showMobileNav={true}
      items={items}
    />
  )
}