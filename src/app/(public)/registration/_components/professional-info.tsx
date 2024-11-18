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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import { WorkStatus } from '@prisma/client'
import { ProfessionalInfoFormData, ProfessionalInfoSchema } from '@/schemas/registration'

interface ProfessionalInfoFormProps {
  onSubmit: (data: ProfessionalInfoFormData) => void
  defaultValues?: Partial<ProfessionalInfoFormData>
  formRef?: React.RefObject<HTMLFormElement>
  isLoading?: boolean
}

export function ProfessionalInfoForm({
                                       onSubmit,
                                       defaultValues,
                                       formRef,
                                       isLoading = false,
                                     }: Readonly<ProfessionalInfoFormProps>) {
  const t = useTranslations('consular_registration')
  const t_assets = useTranslations('assets')

  const form = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(ProfessionalInfoSchema),
    defaultValues: defaultValues || {
      workStatus: WorkStatus.UNEMPLOYED,
    },
  })

  const workStatus = form.watch('workStatus')

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
  })

  // Vérifie si les champs employeur doivent être affichés
  const showEmployerFields = workStatus === WorkStatus.EMPLOYEE

  // Vérifie si le champ profession doit être affiché
  const showProfessionField = workStatus === WorkStatus.EMPLOYEE || workStatus === WorkStatus.ENTREPRENEUR

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Statut professionnel */}
        <Card>
          <CardHeader>
            <CardTitle>{t('form.professional_status')}</CardTitle>
            <FormDescription>{t('form.professional_status_description')}</FormDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="workStatus"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.select_work_status')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(WorkStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t_assets(`work_status.${status.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        {(showProfessionField || showEmployerFields) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('form.professional_info')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {showProfessionField && (
                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.profession')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder={t('form.profession_placeholder')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {showEmployerFields && (
                <>
                  <FormField
                    control={form.control}
                    name="employer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.employer')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            placeholder={t('form.employer_placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.work_address')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            placeholder={t('form.work_address_placeholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dernière activité au Gabon */}
        <Card>
          <CardHeader>
            <CardTitle>{t('form.gabon_activity')}</CardTitle>
            <FormDescription>{t('form.gabon_activity_description')}</FormDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="lastActivityGabon"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={t('form.gabon_activity_placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}