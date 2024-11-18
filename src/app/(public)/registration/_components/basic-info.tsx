import React, { RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, TradFormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { countryKeys } from '@/assets/autocomplete-datas'
import { Gender, NationalityAcquisition } from '@prisma/client'
import DocumentUploadField from '@/components/ui/document-upload'
import { BasicInfoFormData, BasicInfoSchema } from '@/schemas/registration'

type BasicInfoFormProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void
  defaultValues?: Partial<BasicInfoFormData>
  isLoading?: boolean
  formRef: RefObject<HTMLFormElement>
}

export function BasicInfoForm({
                                onSubmit,
                                defaultValues,
                                formRef,
                                isLoading,
                              }: Readonly<BasicInfoFormProps>) {
  const t = useTranslations('registration')
  const t_assets = useTranslations('assets')
  const t_countries = useTranslations('countries')
  const [openNationalitySelect, setOpenNationalitySelect] = React.useState(false)

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: defaultValues || {
      gender: Gender.MALE,
      nationality: 'gabon',
      acquisitionMode: NationalityAcquisition.BIRTH,
    },
  })

  const handleSubmit = async (data: BasicInfoFormData) => {
    try {
      await onSubmit(data)
      return true
    } catch (error) {
      console.error('Error submitting form:', error)
      return false
    }
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name={"identityPictureFile"}
            render={() => (
              <FormItem className="w-full max-w-[200px]">
                <FormLabel>
                  {t('documents.identity_picture.label')}
                </FormLabel>
                <FormControl>
                  <DocumentUploadField
                    id={"identityPictureFile"}
                    field={form.register("identityPictureFile")}
                    form={form}
                    disabled={isLoading}
                    aspectRatio={'square'}
                    existingFile={defaultValues?.identityPictureFile}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />

          {/* Genre */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t('form.gender')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="MALE" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t_assets('gender.male')}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="FEMALE" />
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
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.first_name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('form.first_name_placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.last_name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('form.last_name_placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.birth_date')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      disabled={isLoading}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthPlace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.birth_place')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('form.birth_place_placeholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="birthCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.birth_country')}</FormLabel>
                <Popover
                  open={openNationalitySelect}
                  onOpenChange={setOpenNationalitySelect}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openNationalitySelect}
                      className="w-full justify-between"
                    >
                      {field.value
                        ? t_countries(field.value)
                        : t('form.select_nationality')}
                      <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder={t('form.search_nationality')}
                        className="h-9"
                      />
                      <CommandEmpty>{t('form.no_nationality_found')}</CommandEmpty>
                      <CommandGroup>
                        {countryKeys.map((country) => (
                          <CommandItem
                            key={country}
                            value={country}
                            onSelect={() => {
                              form.setValue('birthCountry', country)
                              setOpenNationalitySelect(false)
                            }}
                          >
                            {t_countries(country)}
                            <CheckIcon
                              className={cn(
                                'ml-auto h-4 w-4',
                                field.value === country
                                  ? 'opacity-100'
                                  : 'opacity-0',
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

          <FormField
            control={form.control}
            name="acquisitionMode"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base">
                  {t('nationaly_acquisition.label')}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-3"
                  >

                    {Object.values(NationalityAcquisition).map((acquisition) => (
                      <FormItem key={acquisition} className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={acquisition} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t(`nationaly_acquisition.modes.${acquisition.toLowerCase()}`)}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}