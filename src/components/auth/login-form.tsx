'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, TradFormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { signIn } from 'next-auth/react'
import { DEFAULT_AUTH_REDIRECT } from '@/routes'
import { Icons } from '@/components/ui/icons'
import { LoginInput, LoginSchema } from '@/schemas'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sendOTP } from '@/actions/auth'
import { PAGE_ROUTES } from '@/schemas/app-routes'

export function LoginForm({ customTitle, customSubTitle }: {
  successCallback?: () => void,
  customTitle?: string,
  customSubTitle?: string
}) {
  const t = useTranslations('auth')
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
    <div className="mx-auto flex w-full flex-col items-center justify-center">
      <Card className={'sm:w-[480px]'}>
        <CardHeader>
          <div className="flex flex-col space-y-2 text-2xl">
            <h1>
              {customTitle ? customTitle : t('page_titles.login')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {customSubTitle ? customSubTitle : t('messages.enter_credentials')}
            </p>
          </div>
        </CardHeader>
        <CardContent className={'space-y-6'}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs
                defaultValue="PHONE"
                value={loginType}
                onValueChange={handleTabChange}
              >
                <TabsList className={'grid w-full grid-cols-2 rounded-full bg-input'}>
                  <TabsTrigger value={'PHONE'}>
                    {t('labels.login_with_phone')}
                  </TabsTrigger>
                  <TabsTrigger value={'EMAIL'}>
                    {t('labels.login_with_email')}
                  </TabsTrigger>
                </TabsList>
                <div className="pt-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {loginType === 'EMAIL' ? t('labels.email') : t('labels.phone')}
                        </FormLabel>
                        <FormControl>
                          {loginType === 'PHONE' ? (
                            <Input
                              {...field}
                              autoFocus={loginType === 'PHONE'}
                              type="tel"
                              autoComplete={'tel-area-code'}
                              placeholder={t('labels.phone_placeholder')}
                            />
                          ) : (
                            <Input
                              {...field}
                              autoFocus={loginType === 'EMAIL'}
                              type="email"
                              placeholder={t('labels.email_placeholder')}
                              autoComplete="email webauthn"
                            />
                          )}
                        </FormControl>
                        <TradFormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Tabs>

              {isOTPSent && (
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('labels.otp')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('labels.otp_placeholder')}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !form.getValues('identifier')}
              >
                {isLoading ? (
                  <>
                    <Icons.Spinner className="mr-2 size-4 animate-spin" />
                    {t('messages.loading')}
                  </>
                ) : (
                  isOTPSent ? t('actions.verify') : t('actions.send_otp')
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export function SocialAuth() {
  const t = useTranslations('auth')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const onClick = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(provider)
      await signIn(provider, { callbackUrl: DEFAULT_AUTH_REDIRECT })
    } catch (error) {
      console.error('Social auth error:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="actions mb-2 flex w-full gap-4">
      <Button
        onClick={() => onClick('google')}
        variant="outline"
        type="button"
        className={'w-full'}
        disabled={isLoading === 'google'}
      >
        {isLoading === 'google' ? (
          <Icons.Spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.Google className="mr-2 size-4" />
        )}
        {t('actions.login_with', { provider: 'Google' })}
      </Button>

      <Button
        onClick={() => onClick('facebook')}
        variant="outline"
        type="button"
        className={'w-full'}
        disabled={isLoading === 'facebook'}
      >
        {isLoading === 'facebook' ? (
          <Icons.Spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.Facebook className="mr-2 size-4" />
        )}
        {t('actions.login_with', { provider: 'Facebook' })}
      </Button>
    </div>
  )
}