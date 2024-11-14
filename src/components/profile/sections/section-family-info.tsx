import { UseFormReturn } from 'react-hook-form'
import { ProfileDataInput } from '@/components/consular/schema'
import { useTranslations } from 'next-intl'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MaritalStatus } from '@prisma/client'
import { PhoneInput } from '@/components/ui/phone-input'

type Props = {
  form: UseFormReturn<ProfileDataInput>
}

export function SectionFamilyInfo({ form }: Props) {
  const t = useTranslations('profile')
  const t_assets = useTranslations('assets')

  const maritalStatus = form.watch('familyInfo.maritalStatus')
  const showSpouseFields = maritalStatus === MaritalStatus.MARRIED

  return (
    <div className="space-y-6">
      {/* État civil */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="familyInfo.maritalStatus"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t('labels.marital_status')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('placeholders.select_marital_status')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(MaritalStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t_assets(`marital_status.${status.toLowerCase()}`)}
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
          <FormField
            control={form.control}
            name="familyInfo.spouseFullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('labels.spouse_name')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('placeholders.spouse_name')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Informations des parents */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="familyInfo.fatherFullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.father_name')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('placeholders.father_name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="familyInfo.motherFullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.mother_name')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('placeholders.mother_name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contact d'urgence */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">{t('labels.emergency_contact')}</h3>
          <FormDescription>
            {t('descriptions.emergency_contact')}
          </FormDescription>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="familyInfo.emergencyContact.fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('labels.emergency_contact_name')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('placeholders.emergency_contact_name')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="familyInfo.emergencyContact.relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('labels.emergency_contact_relationship')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('placeholders.emergency_contact_relationship')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="familyInfo.emergencyContact.phone"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>{t('labels.emergency_contact_phone')}</FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder={t('placeholders.emergency_contact_phone')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}