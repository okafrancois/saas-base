import { NavItem } from '@/components/layouts/types'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SidebarProps {
  items: NavItem[]
  className?: string
}

export function CustomSidebar({ items, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("w-64 bg-white shadow-sm", className)}>
      <div className="p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}