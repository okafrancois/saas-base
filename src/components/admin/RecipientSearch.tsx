'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { searchProfile } from '@/actions/user'
import { useTranslations } from 'next-intl'

type RecipientSearchProps = {
  onSelect: (ids: string[]) => void
}

export function RecipientSearch({ onSelect }: RecipientSearchProps) {
  const t = useTranslations('notifications')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string }>>([])
  const [selectedRecipients, setSelectedRecipients] = useState<Array<{ id: string; name: string }>>([])

  const form = useForm({
    defaultValues: {
      search: '',
    },
  })

  const onSearch = async (data: { search: string }) => {
    const results = await searchProfile(data.search)

    console.log(results)
    setSearchResults(results.map(profile => ({
      id: profile.id,
      name: `${profile.firstName} ${profile.lastName}`,
    })))
  }

  const addRecipient = (recipient: { id: string; name: string }) => {
    setSelectedRecipients(prev => [...prev, recipient])
    setSearchResults(prev => prev.filter(r => r.id !== recipient.id))
    onSelect([...selectedRecipients, recipient].map(r => r.id))
  }

  const removeRecipient = (id: string) => {
    setSelectedRecipients(prev => prev.filter(r => r.id !== id))
    onSelect(selectedRecipients.filter(r => r.id !== id).map(r => r.id))
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSearch)} className="mb-4 flex gap-2">
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className={'w-full'}>
                <FormControl>
                  <Input {...field} placeholder={t('form.search_recipients')} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">{t('form.search')}</Button>
        </form>
      </Form>

      <div className="mb-4">
        <h4>{t('form.selected_recipients')}</h4>
        {selectedRecipients.map(recipient => (
          <div key={recipient.id} className="flex items-center gap-2">
            <span>{recipient.name}</span>
            <Button type={'button'} onClick={() => removeRecipient(recipient.id)} variant="ghost" size="sm">
              {t('form.remove')}
            </Button>
          </div>
        ))}
      </div>

      <div>
        <h4>{t('form.search_results')}</h4>
        {searchResults.map(result => (
          <div key={result.id} className="flex items-center gap-2">
            <span>{result.name}</span>
            <Button type={'button'} onClick={() => addRecipient(result)} variant="ghost" size="sm">
              {t('form.add')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}