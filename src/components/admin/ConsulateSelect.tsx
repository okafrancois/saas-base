'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { ListingConsulate } from '@/lib/models-types'

type ConsulateSelectProps = {
  onSelect: (id: string) => void
  consulates: ListingConsulate[]
}

export function ConsulateSelect({ onSelect, consulates }: ConsulateSelectProps) {
  const t = useTranslations('notifications')

  const form = useForm({
    defaultValues: {
      consulateId: '',
    },
  })

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="consulateId"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Select onValueChange={(value) => {
                field.onChange(value)
                onSelect(value)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={t('form.select_consulate')} />
                </SelectTrigger>
                <SelectContent>
                  {consulates.map(consulate => (
                    <SelectItem key={consulate.id} value={consulate.id}>
                      {consulate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  )
}