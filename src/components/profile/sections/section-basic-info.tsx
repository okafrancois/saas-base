import { UseFormReturn } from 'react-hook-form'
import { ProfileDataInput } from '@/components/consular/schema'
import { useTranslations } from 'next-intl'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Gender } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { countryKeys } from '@/assets/autocomplete-datas'
import { useState } from 'react'
import DocumentUploadField from '@/components/ui/document-upload'

type Props = {
  form: UseFormReturn<ProfileDataInput>
}

export function SectionBasicInfo({ form }: Props) {
  const t = useTranslations('profile')
  const t_countries = useTranslations('countries')
  const t_assets = useTranslations('assets')
  const [openBirthCountry, setOpenBirthCountry] = useState(false)

  return (
    <div className="space-y-4">

      <FormField
        control={form.control}
        name="basicInfo.identityPictureFile"
        render={() => (
          <FormItem className={"max-w-[200px]"}>
            <FormLabel>{t('labels.identity_picture')}</FormLabel>
            <FormControl>
              <DocumentUploadField
                field={form.register('basicInfo.identityPictureFile')}
                form={form}
                accept={'image/*, application/pdf'}
                id={'identityPicture'}
                aspectRatio={"square"}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="basicInfo.gender"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>{t('labels.gender')}</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-row space-x-4"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={Gender.MALE} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {t_assets('gender.male')}
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={Gender.FEMALE} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {t_assets('gender.female')}
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="basicInfo.firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.first_name')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('placeholders.first_name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="basicInfo.lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.last_name')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('placeholders.last_name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="basicInfo.birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.birth_date')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="basicInfo.birthPlace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.birth_place')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('placeholders.birth_place')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="basicInfo.birthCountry"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>{t('labels.birth_country')}</FormLabel>
              <Popover open={openBirthCountry} onOpenChange={setOpenBirthCountry}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openBirthCountry}
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
                            form.setValue('basicInfo.birthCountry', country)
                            setOpenBirthCountry(false)
                          }}
                        >
                          {t_countries(country)}
                          <CheckIcon
                            className={cn(
                              'ml-auto h-4 w-4',
                              field.value === country
                                ? 'opacity-100'
                                : 'opacity-0'
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
    </div>
  )
}