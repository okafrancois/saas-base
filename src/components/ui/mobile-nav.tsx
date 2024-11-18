"use client"

import { Button } from "./button"
import { Sheet, SheetContent, SheetTrigger } from "./sheet"
import { Menu } from "lucide-react"
import { NavItem } from "../layouts/types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useTranslations } from 'next-intl'

interface MobileNavProps {
  items?: NavItem[]
}

export function MobileNav({ items = [] }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('common')

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">{t('open_menu')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pl-1 pr-0">
        <div className="px-7">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="font-bold">Consulat.ga</span>
          </Link>
        </div>
        <div className="my-4 px-4">
          <nav className="flex flex-col space-y-2">
            {items.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}