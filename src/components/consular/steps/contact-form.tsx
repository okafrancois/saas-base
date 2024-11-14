import React from 'react'
import { useForm } from 'react-hook-form'
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
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useTranslations } from 'next-intl'
import { countryKeys } from '@/assets/autocomplete-datas'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { PhoneInput } from '@/components/ui/phone-input'
import { ContactInfoSchema } from '@/components/consular/schema'
import { Separator } from '@/components/ui/separator'

// Type for contact info
type ContactInfo = {
  email?: string
  phone?: string
  address: {
    firstLine: string
    secondLine?: string
    city: string
    zipCode: string
    country: string
  }
  addressGabon?: {
    address: string
    district: string
    city: string
  }
}

interface ContactInfoFormProps {
  onSubmit: (data: ContactInfo) => void
  defaultValues?: Partial<ContactInfo>
  isLoading?: boolean
  formRef?: React.RefObject<HTMLFormElement>
}

export function ContactInfoForm({
                                  onSubmit,
                                  defaultValues,
                                  isLoading = false,
                                  formRef,
                                }: Readonly<ContactInfoFormProps>) {
  const t = useTranslations('consular_registration')
  const t_countries = useTranslations('countries')
  const [openCountrySelect, setOpenCountrySelect] = React.useState(false)

  const form = useForm<ContactInfo>({
    resolver: zodResolver(ContactInfoSchema),
    defaultValues: defaultValues || {
      email: '',
      phone: '',
      address: {
        firstLine: '',
        secondLine: '',
        city: '',
        zipCode: '',
        country: '',
      },
      addressGabon: {
        address: '',
        district: '',
        city: '',
      },
    },
  })

  const handleSubmit = (data: ContactInfo) => {
    onSubmit(data)
  }

  const country = form.watch('address.country')
  const showGabonAddress = country && country !== 'gabon'

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full col-span-full md:col-span-1">
                <FormLabel>{t('form.email')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('form.email_placeholder')}
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full col-span-full md:col-span-1">
                <FormLabel>{t('form.phone')}</FormLabel>
                <FormControl>
                  <PhoneInput
                    disabled={isLoading}
                    placeholder={t('form.phone_placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="col-span-full" />

          {/* Current Address */}
          <fieldset className="col-span-full grid grid-cols-2 gap-x-4 space-y-4">
            <legend className="text-sm font-medium">{t('form.address')}</legend>

            {/* Address Line 1 */}
            <FormField
              control={form.control}
              name="address.firstLine"
              render={({ field }) => (
                <FormItem className={"col-span-full md:col-span-1"}>
                  <FormLabel>{t('form.street_address')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('form.street_address_placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Line 2 */}
            <FormField
              control={form.control}
              name="address.secondLine"
              render={({ field }) => (
                <FormItem className={"col-span-full md:col-span-1"}>
                  <FormLabel>{t('form.second_line')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={t('form.address_complement_placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City and Zip Code */}
            <div className="col-span-full grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem className={"col-span-2"}>
                    <FormLabel>{t('form.city')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.city_placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.postal_code')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.postal_code_placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Country */}
            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem className={"col-span-full"}>
                  <FormLabel>{t('form.country')}</FormLabel>
                  <Popover
                    open={openCountrySelect}
                    onOpenChange={setOpenCountrySelect}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCountrySelect}
                        className="w-full justify-between"
                      >
                        {field.value
                          ? t_countries(field.value)
                          : t('form.select_country')}
                        <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder={t('form.search_country')}
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>{t('form.no_country_found')}</CommandEmpty>
                          <CommandGroup>
                            {countryKeys.map((countryKey) => (
                              <CommandItem
                                key={countryKey}
                                value={countryKey}
                                onSelect={() => {
                                  form.setValue('address.country', countryKey)
                                  setOpenCountrySelect(false)
                                }}
                              >
                                {t_countries(countryKey)}
                                <CheckIcon
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    field.value === countryKey
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>

          <Separator className="col-span-full" />

          {/* Gabon Address */}
          {showGabonAddress && (
            <fieldset className="col-span-2 space-y-4">
              <legend className="text-sm font-medium">{t('form.address_gabon')}</legend>

              {/* Gabon Address */}
              <FormField
                control={form.control}
                name="addressGabon.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.street_address')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.street_address_placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* District */}
              <FormField
                control={form.control}
                name="addressGabon.district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.district')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.district_placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City */}
              <FormField
                control={form.control}
                name="addressGabon.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.city')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.city_placeholder')}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
          )}
        </div>
      </form>
    </Form>
  )
}