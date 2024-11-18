import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

export default async function AuthLayout({
                                           children,
                                         }: Readonly<{
  children: React.ReactNode
}>) {
  const t = await getTranslations('auth.layout')

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900">
          <Image
            src="https://placehold.co/1200x800/1a1a1a/ffffff?text=Consulat"
            alt="Authentication background"
            fill
            priority
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <span className="text-primary">{t('step')}</span>
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