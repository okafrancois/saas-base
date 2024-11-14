'use client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChatWindow } from './chat-window'
import LottieAnimation from '@/components/ui/lottie-animation'

export function ChatToggle() {
  const t = useTranslations('chatbot')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="fixed flex flex-col items-center bottom-10 right-4 rounded-full p-0 md:bottom-4 md:right-6"
          aria-label={t('chat_with_ray')}
        >
          {isOpen ? (
            <X className="size-6" />
          ) : (
            <div className="size-16">
              <LottieAnimation
                src="https://lottie.host/9c0ec107-750e-4fb2-bdc3-ed7d2d869f57/LOYStpq01r.json"
                loop={true}
                className="w-full h-full"
              />
            </div>
          )}
          <span className={"text-xs font-bold"}>Ray</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[500px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle>{t('chat_with_ray')}</SheetTitle>
        </SheetHeader>
        <div className="py-6 h-full">
          <ChatWindow />
        </div>
      </SheetContent>
    </Sheet>
  )
}