'use client'

import * as React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { ConsulateSchema, ConsulateInput } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormError } from '@/components/form-error'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { FormSuccess } from '@/components/form-success'
import { FullConsulate } from '@/lib/models-types'
import { Separator } from '@/components/ui/separator'
import { FilePreview } from '@/components/file-preview'
import Image from 'next/image'
import { ACCEPTED_FILE_TYPES, cn } from '@/lib/utils'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { Route } from 'next'
import { postConsulate, updateConsulate } from '@/actions/consulate'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { XCircleIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { countryKeys } from '@/assets/autocomplete-datas'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'next-intl'

type ProfileFormContentProps = {
  data?: FullConsulate
}
type CountryField = {
  id?: string;
  name: string;
};

export function ConsulateFormContent({
                                       data,
                                     }: Readonly<ProfileFormContentProps>) {
  const t = useTranslations('consulate')
  const t_country = useTranslations('countries')
  const router = useRouter()
  const [error, setError] = React.useState<string | undefined>()
  const [success, setSuccess] = React.useState<string | undefined>(undefined)
  const [isPending, startTransition] = React.useTransition()
  const [openCountrySelect, setOpenCountrySelect] = React.useState(false)

  const form = useForm<ConsulateInput>({
    resolver: zodResolver(ConsulateSchema),
    defaultValues: {
      logo: data?.logo ?? undefined,
      logoFile: undefined,
      name: data?.name ?? undefined,
      email: data?.email ?? undefined,
      phone: data?.phone ?? undefined,
      address: data?.address ?? undefined,
      website: data?.website ?? undefined,
      countries: data?.countries ?? [],
      isGeneral: data?.isGeneral ?? false,
    },
  })

  const logoRef = form.register('logoFile')
  const countriesArray = useFieldArray<ConsulateInput, 'countries', 'id'>({
    control: form.control,
    name: 'countries',
  });

  async function onPostSubmit(values: ConsulateInput) {
    setError(undefined)
    startTransition(() => {
      const { logoFile, ...consulateData } = values
      let logoFormData

      if (logoFile && logoFile.length > 0) {
        logoFormData = new FormData()
        logoFormData.append('files', logoFile[0])
      }

      if (data) {
        // Mise à jour d'un consulat existant
        updateConsulate(data.id, consulateData, logoFormData)
          .then(() => {
            setSuccess(t('messages.consulate_updated'))
            router.refresh()
          })
          .catch((error: Error) => {
            setError(error.message)
          })
      } else {
        // Création d'un nouveau consulat
        postConsulate(consulateData, logoFormData)
          .then((data) => {
            setSuccess(t('messages.consulate_added'))
            router.push(`${PAGE_ROUTES.consulates}/${data.id}` as Route)
          })
          .catch((error: Error) => {
            setError(error.message)
          })
      }
    })
  }

  return (
    <Form {...form}>
      <form className={'space-y-6 pb-6'} onSubmit={form.handleSubmit(onPostSubmit)}>
        <Card>
          <CardHeader>
            <h3 className={'text-lg'}>{t('sections.basic_info')}</h3>
          </CardHeader>
          <CardContent className={'space-y-5'}>
            <FormField
              control={form.control}
              name="logoFile"
              render={({ field }) => {
                return (
                  <FormItem
                    className={
                      'flex w-full max-w-max flex-wrap items-center justify-between gap-3 md:flex-nowrap'
                    }
                  >
                    <div className={'w-full space-y-2'}>
                      <FormLabel htmlFor={'avatarFile'}>
                        {t('labels.logo')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className={'cursor-pointer'}
                          type={'file'}
                          id={'avatarFile'}
                          accept={ACCEPTED_FILE_TYPES.join(', ')}
                          {...logoRef}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                    <FilePreview
                      render={(url) => (
                        <Image
                          src={url}
                          alt={'Logo image preview'}
                          unoptimized={true}
                          className={
                            'aspect-square w-[100px] rounded-full object-cover object-center'
                          }
                          width={100}
                          height={100}
                        />
                      )}
                      files={field.value as never}
                      fileUrl={data?.logo?.url}
                    />
                  </FormItem>
                )
              }}
            />

            <FormField
              disabled={isPending}
              control={form.control}
              render={({ field }) => (
                <FormItem className={'w-full'}>
                  <FormLabel htmlFor={'name'}>{t('labels.name')}</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus={true}
                      {...field}
                      id={'name'}
                      type={'text'}
                      placeholder={t('placeholders.enter_name')}
                      autoComplete={'consulates-name'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name={'name'}
            />

            <FormField
              control={form.control}
              name="isGeneral"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className={'!mt-0'}>
                    {t('labels.is_general')}
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className={'space-y-2'}>
              <FormLabel>{t('labels.countries')}</FormLabel>
              <Popover
                open={openCountrySelect}
                onOpenChange={setOpenCountrySelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    aria-expanded={openCountrySelect}
                    className="col-span-full w-full justify-between"
                  >
                    {t('messages.select_country')}
                    <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder={t('messages.search_country')}
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>{t('messages.no_countries')}</CommandEmpty>
                      <CommandGroup>
                        {countryKeys.map((framework, index) => (
                          <CommandItem
                            key={framework + index}
                            onSelect={() => {
                              countriesArray.append({ name: framework })
                              setOpenCountrySelect(false)
                            }}
                          >
                            {t_country(framework)}
                            <CheckIcon
                              className={cn(
                                'ml-auto h-4 w-4',
                                countriesArray.fields.some(
                                  (country: CountryField) => country.name === framework,
                                )
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {countriesArray.fields.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {countriesArray.fields.map((field: CountryField, index) => (
                    <Badge
                      key={field.id}
                      className={
                        'flex items-center justify-between gap-2 px-2 py-1'
                      }
                      variant={'outline'}
                    >
                      <span>{t_country(field.name)}</span>
                      <Button
                        type={'button'}
                        variant={'link'}
                        className={
                          'flex aspect-square size-5 items-center justify-center rounded-full p-0 text-red-500'
                        }
                        onClick={() => countriesArray.remove(index)}
                      >
                        <XCircleIcon className={'size-5'} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField
              disabled={isPending}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={'website'}>{t('labels.website')}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      {...field}
                      id={'website'}
                      placeholder={t('placeholders.enter_website')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name={'website'}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className={'text-lg'}>{t('sections.contact_info')}</h3>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <FormField
              disabled={isPending}
              control={form.control}
              name={`phone`}
              render={({ field }) => (
                <FormItem className={'w-full'}>
                  <FormLabel>{t('labels.phone')}</FormLabel>
                  <FormControl>
                    <Input
                      type={'tel'}
                      {...field}
                      placeholder={t('placeholders.enter_phone')}
                      autoComplete={'tel-international'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              disabled={isPending}
              control={form.control}
              name={`email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('placeholders.enter_email')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className={'grid grid-cols-2 gap-2'}>
              <FormField
                disabled={isPending}
                control={form.control}
                name={`address.firstLine`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('labels.first_line')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('placeholders.enter_address')}
                        autoComplete={'address-line1'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isPending}
                control={form.control}
                name={`address.secondLine`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('labels.second_line')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t('placeholders.enter_address')}
                        autoComplete={'address-level2'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isPending}
                control={form.control}
                name={`address.city`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('labels.city')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('placeholders.enter_city')}
                        autoComplete={'address-city'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isPending}
                control={form.control}
                name={`address.zipCode`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('labels.zip_code')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={t('placeholders.enter_zip')}
                        autoComplete={'postal-code'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`address.country`}
                render={({ field }) => (
                  <FormItem className={'col-span-2'}>
                    <FormLabel>{t('labels.country')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('placeholders.enter_country')}
                        autoComplete={'country'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="form-actions flex items-center space-x-4">
          <Button disabled={isPending} type={'submit'} className={'w-full'}>
            {isPending && <Icons.Spinner className="animate-spin" />}
            {data ? t('actions.save') : t('actions.add')}
          </Button>
        </div>
      </form>
    </Form>
  )
}