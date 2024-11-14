import './globals.css'
import { ThemeProvider } from '@/prodivers/theme-provider'
import React from 'react'
import { GeistSans } from 'geist/font/sans'
import type { Metadata, Viewport } from 'next'
import {
  APP_DEFAULT_TITLE,
  APP_DESCRIPTION,
  APP_NAME,
  APP_TITLE_TEMPLATE,
} from '@/lib/utils'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ChatToggle } from '@/components/chat/chat-toggle'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    images: '/cover-image-contact.ga.jpg',
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    images: '/cover-image-contact.ga.jpg',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: '#17A34A',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={GeistSans.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute='class'
            defaultTheme='light'
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ChatToggle />
            <Toaster  />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}