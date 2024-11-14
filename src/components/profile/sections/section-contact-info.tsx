import { UseFormReturn } from 'react-hook-form'
import { ProfileDataInput } from '@/components/consular/schema'
import { useTranslations } from 'next-intl'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { countryKeys } from '@/assets/autocomplete-datas'
import { useState } from 'react'

type Props = {
  form: UseFormReturn<ProfileDataInput>
}

export function SectionContactInfo({ form }: Props) {
  const t = useTranslations('profile')
  const t_countries = useTranslations('countries')
  const [openCurrentCountry, setOpenCurrentCountry] = useState(false)

  const country = form.watch('contactInfo.address.country')
  const showGabonAddress = country && country !== 'gabon'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Contact principal */}
        <FormField
          control={form.control}
          name="contactInfo.email"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>{t('labels.email')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder={t('placeholders.email')}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactInfo.phone"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>{t('labels.phone')}</FormLabel>
              <FormControl>
                <PhoneInput
                  placeholder={t('placeholders.phone')}
                  defaultValue={field.value}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Adresse principale */}
        <FormField
          control={form.control}
          name="contactInfo.address.firstLine"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>{t('labels.address_line1')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('placeholders.address_line1')}
                  autoComplete="address-line1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactInfo.address.secondLine"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>{t('labels.address_line2')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('placeholders.address_line2')}
                  autoComplete="address-line2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactInfo.address.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.city')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('placeholders.city')}
                  autoComplete="address-level2"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactInfo.address.zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.zip_code')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('placeholders.zip_code')}
                  autoComplete="postal-code"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactInfo.address.country"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>{t('labels.country')}</FormLabel>
              <Popover open={openCurrentCountry} onOpenChange={setOpenCurrentCountry}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCurrentCountry}
                    className="w-full justify-between"
                  >
                    {field.value
                      ? t_countries(field.value)
                      : t('placeholders.select_country')}
                    <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder={t('placeholders.search_country')}
                      className="h-9"
                    />
                    <CommandEmpty>{t('messages.no_country_found')}</CommandEmpty>
                    <CommandGroup>
                      {countryKeys.map((country) => (
                        <CommandItem
                          key={country}
                          value={country}
                          onSelect={() => {
                            form.setValue('contactInfo.address.country', country)
                            setOpenCurrentCountry(false)
                          }}
                        >
                          {t_countries(country)}
                          <CheckIcon
                            className={cn(
                              'ml-auto h-4 w-4',
                              field.value === country ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Adresse au Gabon */}
      {showGabonAddress && (
        <div className="space-y-4 rounded-lg bg-muted p-4">
          <h3 className="text-lg font-medium">{t('labels.gabon_address')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactInfo.addressGabon.address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{t('labels.address')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('placeholders.address')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo.addressGabon.district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.district')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('placeholders.district')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo.addressGabon.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.city')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('placeholders.city')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}