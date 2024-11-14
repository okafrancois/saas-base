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
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FamilyInfoSchema, type FamilyInfoFormData } from '@/components/consular/schema'
import { useTranslations } from 'next-intl'
import { MaritalStatus } from '@prisma/client'
import { PhoneInput } from '@/components/ui/phone-input'

interface FamilyInfoFormProps {
  onSubmit: (data: FamilyInfoFormData) => void
  defaultValues?: Partial<FamilyInfoFormData>
  formRef?: React.RefObject<HTMLFormElement>
  isLoading?: boolean
}

export function FamilyInfoForm({ onSubmit, defaultValues, formRef, isLoading }: Readonly<FamilyInfoFormProps>) {
  const t = useTranslations('consular_registration')
  const tAssets = useTranslations('assets')

  const form = useForm<FamilyInfoFormData>({
    resolver: zodResolver(FamilyInfoSchema),
    defaultValues: defaultValues || {
      maritalStatus: undefined,
      fatherFullName: '',
      motherFullName: '',
      emergencyContact: {
        fullName: '',
        relationship: '',
        phone: '',
      },
    },
  })

  const handleSubmit = (data: FamilyInfoFormData) => {
    onSubmit(data)
  }

  const maritalStatus = form.watch('maritalStatus')
  const showSpouseFields = maritalStatus === MaritalStatus.MARRIED

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* État civil */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.marital_status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.select_marital_status')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MaritalStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {tAssets(`marital_status.${status.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Champs spécifiques si marié(e) */}
            {showSpouseFields && (
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="spouseFullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.spouse_name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('form.spouse_name_placeholder')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations des parents */}
        <Card>
          <CardContent className="grid gap-4 pt-6">
            <FormField
              control={form.control}
              name="fatherFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.father_name')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('form.father_name_placeholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motherFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.mother_name')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('form.mother_name_placeholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact d'urgence */}
        <Card>
          <CardContent className="grid gap-4 pt-6">
            <h3 className="text-lg font-semibold">{t('form.emergency_contact')}</h3>
            <FormDescription>{t('form.emergency_contact_description')}</FormDescription>

            <FormField
              control={form.control}
              name="emergencyContact.fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.emergency_contact_name')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('form.emergency_contact_name_placeholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContact.relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.emergency_contact_relationship')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('form.emergency_contact_relationship_placeholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="emergencyContact.phone"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.emergency_contact_phone')}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      placeholder={t('form.emergency_contact_phone_placeholder')}
                      {...field}
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