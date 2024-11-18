import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

export default async function AuthLayout({
                                           children,
                                         }: Readonly<{
  children: React.ReactNode
}>) {
  const t = await getTranslations('auth.layout')

  return (
    <div className="grid h-screen overflow-hidden w-full lg:grid-cols-2">
      <div className="relative hidden max-h-dvh flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900">
          <Image
            src="https://placehold.co/1200x800/1a1a1a/ffffff"
            alt="Authentication background"
            priority
            className="object-cover opacity-50"
            width={1200}
            height={800}
          />
        </div>
        <div className="relative z-20 mt-auto">
          <h1 className="text-4xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center lg:p-8">
        {children}
      </div>
    </div>
  )
}