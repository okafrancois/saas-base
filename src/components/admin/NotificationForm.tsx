'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createNotification } from '@/actions/notifications'
import { useTranslations } from 'next-intl'
import { RecipientSearch } from './RecipientSearch'
import { ConsulateSelect } from './ConsulateSelect'
import { FilesUpload } from '@/components/ui/files-upload'
import { ListingConsulate } from '@/lib/models-types'
import { NotificationType } from '@prisma/client'

const notificationSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  type: z.enum(['INDIVIDUAL', 'CONSULATE']),
  recipientIds: z.array(z.string()).optional(),
  consulateId: z.string().optional(),
  attachments: z.array(z.object({
    url: z.string(),
    filename: z.string(),
    mimeType: z.string(),
  })).optional(),
})

type NotificationFormValues = z.infer<typeof notificationSchema>

export function NotificationForm({ consulates }: { consulates: ListingConsulate[] }) {
  const t = useTranslations('notifications')
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      content: '',
      type: NotificationType.INDIVIDUAL,
      recipientIds: [],
      attachments: [],
    },
  })

  const onSubmit = async (data: NotificationFormValues) => {
    try {
      await createNotification(data)
      // Afficher un message de succès
    } catch (error) {
      // Gérer l'erreur
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.title')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.title_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.content')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('form.content_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.type')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.select_type')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/**<SelectItem value={NotificationType.INDIVIDUAL}>{t('form.type_individual')}</SelectItem>*/}
                  <SelectItem value={NotificationType.CONSULATE}>{t('form.type_consulate')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('type') === NotificationType.INDIVIDUAL && (
          <FormField
            control={form.control}
            name="recipientIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.recipients')}</FormLabel>
                <FormControl>
                  <RecipientSearch onSelect={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch('type') === NotificationType.CONSULATE && (
          <FormField
            control={form.control}
            name="consulateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.consulate')}</FormLabel>
                <FormControl>
                  <ConsulateSelect consulates={consulates} onSelect={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="attachments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.attachments')}</FormLabel>
              <FormControl>
                <FilesUpload onUpload={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">{t('form.submit')}</Button>
      </form>
    </Form>
  )
}