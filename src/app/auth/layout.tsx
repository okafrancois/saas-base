import { getTranslations } from 'next-intl/server'
import { ChatToggle } from '@/components/chat/chat-toggle'

export default async function UnauthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const t = await getTranslations('auth.layout')
  const tHome = await getTranslations('home')

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <main
        className={
          'flex h-screen w-full flex-col items-center justify-center p-4'
        }
      >
        <h1 className="mb-4 font-bold">
          {tHome('consulat')}
        </h1>
        <p className={'mb-6 text-center'}>
          {t('create_card_prompt')}
        </p>
        {children}
        <ChatToggle />
      </main>
    </div>
  )
}