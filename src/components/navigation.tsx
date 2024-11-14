import * as React from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon'
import { MenuItem } from '@/components/side-bar'
import { LogoutButton } from '@/components/logout-button'
import DarkModeToggle from '@/components/ui/darkmode-toggle'
import { RoleGuard } from '@/components/role-guard'
import LangSwitcher from '@/components/LangSwitcher'
import { BellRingIcon } from 'lucide-react'
import { PAGE_ROUTES } from '@/schemas/app-routes'

interface NavMenuProps extends React.HTMLAttributes<HTMLElement> {
  links: MenuItem[]
  unreadCount: number
}

export function NavMenu({
  className,
  links,
                          unreadCount,
  ...props
}: Readonly<NavMenuProps>) {
  return (
    <nav className={cn('flex space-Y-2 flex-col', className)} {...props}>
      {links.map((item, index) => {
        if (!item.roles) {
          return (
            <Link
              key={item.label + index}
              className={
                buttonVariants({
                  variant: 'ghost',
                }) + 'px-0 gap-2 !justify-start w-full'
              }
              href={item.href}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        } else {
          return (
            <RoleGuard roles={item.roles} key={item.label + index}>
              <Link
                className={
                  buttonVariants({
                    variant: 'ghost',
                  }) + 'px-0 gap-2 !justify-start w-full'
                }
                href={item.href}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </RoleGuard>
          )
        }
      })}
      <Link
        className={
          buttonVariants({
            variant: 'ghost',
          }) + 'px-0 gap-2 flex items-center !justify-start w-full'
        }
        href={PAGE_ROUTES.notifications}
      >
        <BellRingIcon className={'size-6'} />
        <span>Messages</span>
        {unreadCount > 0 && (
          <span
            className="inline-flex aspect-square size-5 items-center justify-center rounded-full bg-red-500 p-1 text-center text-xs text-white">
            {unreadCount}
          </span>
        )}
      </Link>
    </nav>
  )
}

interface SidebarProps {
  links: MenuItem[]
  unreadCount: number
}

export function MobileMenu({ links, unreadCount }: Readonly<SidebarProps>) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          className={'!h-12 !w-14 rounded-full'}
          variant={'outline'}
          type={'button'}
        >
          <HamburgerMenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className={'container space-y-4 pb-4 md:max-w-[450px]'}>
        <div className="relative flex flex-col items-center gap-2">
          {links.map((item, index) => {
            if (!item.roles) {
              return (
                <DrawerClose key={item.label + index} asChild>
                  <Link
                    className={
                      buttonVariants({
                        variant: 'ghost',
                      }) + 'px-0 gap-2 !justify-start w-full'
                    }
                    href={item.href}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </DrawerClose>
              )
            } else {
              return (
                <RoleGuard roles={item.roles} key={item.label + index}>
                  <DrawerClose key={item.label + index} asChild>
                    <Link
                      className={
                        buttonVariants({
                          variant: 'ghost',
                        }) + 'px-0 gap-2 !justify-start w-full'
                      }
                      href={item.href}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </DrawerClose>
                </RoleGuard>
              )
            }
          })}
          <Link
            className={
              buttonVariants({
                variant: 'ghost',
              }) + 'px-0 gap-2 flex items-center !justify-start w-full'
            }
            href={PAGE_ROUTES.notifications}
          >
            <BellRingIcon className={'size-6'} />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
            {unreadCount}
          </span>
            )}
          </Link>
          <div className={'absolute right-0 top-0 px-4'}>
            <DarkModeToggle />
          </div>
        </div>

        <DrawerFooter>
          <div className={'flex justify-between'}>
            <LangSwitcher />
            
            <LogoutButton customClass={'px-0'} />
            <DrawerClose asChild>
              <Button aria-label={'Fermer le menu'} variant="outline">
                <span className="sr-only">Fermer le menu</span>
                <CloseIcon />
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}