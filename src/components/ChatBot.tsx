'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslations } from 'next-intl'
import { MessageSquare, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { chatWithRay } from '@/actions/chat'
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export function ChatBot() {
  const t = useTranslations('chatbot')
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: t('welcome_message') }])
    }
  }, [isOpen, messages.length, t])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (input.trim() === '') return

    const userMessage = { role: 'user' as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await chatWithRay(input)

      console.log({ response })
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [...prev, { role: 'assistant', content: t('error_message') }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 rounded-full px-4 py-5 md:bottom-4 md:right-6"
        aria-label={t('chat_with_ray')}
      >
        {isOpen ? <CloseIcon /> : <MessageSquare />}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-32 right-4 w-full max-w-[93%] md:bottom-16 md:right-6 md:max-w-[420px]">
          <CardHeader>{t('chat_with_ray')}</CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <span
                    className={`inline-block rounded-lg px-4 py-2 ${
                      message.role === 'user' ? 'border' : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </span>
                </div>
              ))}
              {isLoading && <div className="text-center">{t('typing')}</div>}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('input_placeholder')}
                className="grow"
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="size-4" />
                <span className="sr-only">{t('send')}</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}