'use client'

import React, { RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
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
import { Gender } from '@prisma/client'
import DocumentUploadField from '@/components/ui/document-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BasicInfoSchema } from '@/schemas/registration'
import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'

type BasicInfoFormProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void
  defaultValues?: Partial<BasicInfoFormData>
  isLoading?: boolean
  formRef: RefObject<HTMLFormElement>
}

type BasicInfoFormData = {
  gender: Gender
  firstName: string
  lastName: string
  birthDate: string
  birthPlace: string
  birthCountry: string
  nationality: string
  identityPictureFile?: FileList
  passportNumber: string
  passportIssueDate: Date
  passportExpiryDate: Date
  passportIssueAuthority: string
}

export function BasicInfoForm({
                                onSubmit,
                                defaultValues,
                                formRef,
                                isLoading,
                              }: Readonly<BasicInfoFormProps>) {
  const t = useTranslations('consular_registration')
  const t_assets = useTranslations('assets')
  const t_countries = useTranslations('countries')

  const [openNationalitySelect, setOpenNationalitySelect] = React.useState(false)

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: defaultValues || {
      gender: Gender.MALE,
      nationality: 'gabon',
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

  // Helper pour vérifier si un champ a une erreur
  const hasFieldError = (fieldName: keyof BasicInfoFormData) => {
    return !!form.formState.errors[fieldName]
  }

  // Helper pour obtenir le statut de validation d'un champ
  const getFieldValidationStatus = (fieldName: keyof BasicInfoFormData) => {
    if (!form.formState.touchedFields[fieldName]) return 'untouched'
    if (hasFieldError(fieldName)) return 'error'
    return 'valid'
  }

  // Composant pour afficher le statut de validation
  const ValidationStatus = ({ status }: { status: string }) => {
    if (status === 'untouched') return null

    return status === 'valid' ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-destructive" />
    )
  }

  // Composant amélioré pour le label avec tooltip et validation
  const FormFieldLabel = ({
                            label,
                            tooltipKey,
                            required = false,
                            status,
                          }: {
    label: string
    tooltipKey: string
    required?: boolean
    status: string
  }) => (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <FormLabel>
          {label}
          {required && <span className="text-destructive">*</span>}
        </FormLabel>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{t(`tooltips.passport.${tooltipKey}`)}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <ValidationStatus status={status} />
    </div>
  )

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6">
          {/* Photo d'identité */}
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
                <TradFormMessage />
              </FormItem>
            )}
          />

          {/* Informations de base */}
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
                  <TradFormMessage />
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
                  <TradFormMessage />
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
                  <TradFormMessage />
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
                  <TradFormMessage />
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
                                  : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <TradFormMessage />
              </FormItem>
            )}
          />

          {/* Section Passeport avec validation améliorée */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {t('form.passport.section_title')}
                {Object.keys(form.formState.errors).some(key =>
                  key.startsWith('passport')
                ) && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('form.passport.section_description')}
              </p>
            </CardHeader>
            <CardContent className="grid gap-4">
              {/* Alerte de validation du passeport */}
              {Object.keys(form.formState.errors).some(key =>
                key.startsWith('passport')
              ) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('form.passport.validation_errors')}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel
                      label={t('form.passport.number.label')}
                      tooltipKey="number"
                      required
                      status={getFieldValidationStatus('passportNumber')}
                    />
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.passport.number.placeholder')}
                        disabled={isLoading}
                        className={cn(
                          hasFieldError('passportNumber') && 'border-destructive',
                          getFieldValidationStatus('passportNumber') === 'valid' && 'border-green-500'
                        )}
                      />
                    </FormControl>
                    <TradFormMessage />
                    {field.value && !hasFieldError('passportNumber') && (
                      <p className="text-xs text-muted-foreground">
                        {t('form.passport.number.help')}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="passportIssueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldLabel
                        label={t('form.passport.issue_date.label')}
                        tooltipKey="issue_date"
                        required
                        status={getFieldValidationStatus('passportIssueDate')}
                      />
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={isLoading}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            field.onChange(new Date(e.target.value))
                          }}
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          className={cn(
                            hasFieldError('passportIssueDate') && 'border-destructive',
                            getFieldValidationStatus('passportIssueDate') === 'valid' && 'border-green-500'
                          )}
                        />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passportExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldLabel
                        label={t('form.passport.expiry_date.label')}
                        tooltipKey="expiry_date"
                        required
                        status={getFieldValidationStatus('passportExpiryDate')}
                      />
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={isLoading}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            field.onChange(new Date(e.target.value))
                          }}
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          className={cn(
                            hasFieldError('passportExpiryDate') && 'border-destructive',
                            getFieldValidationStatus('passportExpiryDate') === 'valid' && 'border-green-500'
                          )}
                        />
                      </FormControl>
                      <TradFormMessage />
                      {hasFieldError('passportExpiryDate') && (
                        <p className="text-xs text-destructive">
                          {t('form.passport.expiry_date.minimum_validity')}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="passportIssueAuthority"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldLabel
                      label={t('form.passport.authority.label')}
                      tooltipKey="authority"
                      required
                      status={getFieldValidationStatus('passportIssueAuthority')}
                    />
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('form.passport.authority.placeholder')}
                        disabled={isLoading}
                        className={cn(
                          hasFieldError('passportIssueAuthority') && 'border-destructive',
                          getFieldValidationStatus('passportIssueAuthority') === 'valid' && 'border-green-500'
                        )}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  )
}