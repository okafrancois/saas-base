import * as React from 'react'
import { useTranslations } from 'next-intl'
import { ContactFormInput, ContactFormSchema } from '@/schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/form-error'
import { FormSuccess } from '@/components/ui/form-success'
import { SendHorizonalIcon } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { sendContactEmail } from '@/actions/email'

type Props = {
  target: {
    email: string
    fullName: string
  }
  customButton?: React.ReactNode
}

export function ContactForm({ target, customButton }: Readonly<Props>) {
  const t = useTranslations('contact_form')
  const [success, setSuccess] = React.useState<string | undefined>()
  const [error, setError] = React.useState<string | undefined>()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      message: '',
    },
  })

  async function onSubmit(values: ContactFormInput) {
    startTransition(() => {
      setError(undefined)
      setSuccess(undefined)

      sendContactEmail(values, {
        email: target.email,
        fullName: target.fullName,
      })
        .then((response) => {
          setSuccess(response.success)
          form.reset()
        })
        .catch((error) => {
          setError(error.message)
        })
    })
  }

  return (
    <Form {...form}>
      <form className={'space-y-6'} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={'firstName'}>{t('first_name')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    {...field}
                    id={'firstName'}
                    type={'firstName'}
                    placeholder={t('first_name_placeholder')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name={'firstName'}
          />

          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={'lastName'}>{t('last_name')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    {...field}
                    id={'lastName'}
                    type={'lastName'}
                    placeholder={t('last_name_placeholder')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name={'lastName'}
          />

          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={'phoneNumber'}>{t('phone')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    {...field}
                    id={'phoneNumber'}
                    type={'tel'}
                    placeholder={t('phone_placeholder')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name={'phoneNumber'}
          />

          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={'email'}>
                  {t('email')} <span className={'text-red-500'}>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    {...field}
                    id={'email'}
                    type={'email'}
                    placeholder={t('email_placeholder')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name={'email'}
          />

          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem className={'col-span-2'}>
                <FormLabel htmlFor={'companyName'}>
                  {t('company_name')}
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    {...field}
                    id={'companyName'}
                    type={'text'}
                    placeholder={t('company_name_placeholder')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name={'companyName'}
          />

          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem className={'col-span-2'}>
                <FormLabel htmlFor={'message'}>{t('message')}</FormLabel>
                <FormDescription>{t('message_description')}</FormDescription>
                <FormControl>
                  <Textarea disabled={isPending} {...field} id={'message'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name={'message'}
          />
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="form-actions flex justify-center gap-2">
          {customButton}
          <Button
            disabled={isPending}
            type={'submit'}
            className={'w-1/2 gap-x-2'}
          >
            <SendHorizonalIcon className={'size-6'} />
            <span>{t('send')}</span>
          </Button>
        </div>
        <p className={'w-full text-center text-sm text-muted-foreground'}>
          {t('privacy_notice')}
        </p>
      </form>
    </Form>
  )
}