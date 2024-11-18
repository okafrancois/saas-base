'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TradFormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { signIn } from 'next-auth/react'
import { Icons } from '@/components/ui/icons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sendOTP } from '@/actions/auth'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { LoginInput, LoginSchema } from '@/schemas/user'

export function LoginForm({
                            customTitle,
                            customSubTitle
                          }: {
  successCallback?: () => void,
  customTitle?: string,
  customSubTitle?: string
}) {
  const t = useTranslations('auth.login')
  const [isOTPSent, setIsOTPSent] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: '',
      type: 'PHONE',
      otp: '',
    },
    mode: 'onSubmit',
  })

  // Get callbackUrl from URL using URLSearchParams
  const callbackUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null

  const loginType = form.watch('type')

  const onSubmit = async (values: LoginInput) => {
    try {
      setIsLoading(true)
      setError(undefined)
      setSuccess(undefined)

      if (!isOTPSent) {
        // Send OTP
        const result = await sendOTP(values.identifier, values.type)
        if (result && result.error) {
          setError(result.error)
          return
        }
        if (result && result.success) {
          setSuccess(t('messages.otp_sent'))
          setIsOTPSent(true)
          return
        }
        return
      }

      // Verify OTP and sign in
      const signInResult = await signIn('credentials', {
        identifier: values.identifier,
        type: values.type,
        otp: values.otp,
        redirect: true,
        redirectTo: callbackUrl || PAGE_ROUTES.base,
      })

      if (signInResult?.error) {
        setError(t('messages.otp_invalid'))
        return
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(t('messages.something_went_wrong'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = React.useCallback((value: string) => {
    form.reset({
      identifier: '',
      type: value as 'EMAIL' | 'PHONE',
      otp: '',
    })
    setError(undefined)
    setSuccess(undefined)
    setIsOTPSent(false)
  }, [form])

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('welcome')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs
              defaultValue="PHONE"
              value={loginType}
              onValueChange={handleTabChange}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="PHONE">
                  {t('tabs.phone')}
                </TabsTrigger>
                <TabsTrigger value="EMAIL">
                  {t('tabs.email')}
                </TabsTrigger>
              </TabsList>

              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="identifier">
                      {t(`inputs.${loginType.toLowerCase()}.label`)}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="identifier"
                        type={loginType === 'EMAIL' ? 'email' : 'tel'}
                        placeholder={t(`inputs.${loginType.toLowerCase()}.placeholder`)}
                        autoComplete={loginType === 'EMAIL' ? 'email' : 'tel'}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        aria-describedby="identifier-description"
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              {isOTPSent && (
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="otp">
                        {t('inputs.otp.label')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="otp"
                          placeholder={t('inputs.otp.placeholder')}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          autoComplete="one-time-code"
                          aria-describedby="otp-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </Tabs>

            {error && (
              <p
                className="text-sm text-red-500"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <Icons.Spinner
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : isOTPSent ? (
                t('buttons.verify')
              ) : (
                t('buttons.get_code')
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}