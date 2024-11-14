import { UseFormReturn } from 'react-hook-form'
import { ProfileDataInput } from '@/components/consular/schema'
import { useTranslations } from 'next-intl'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WorkStatus } from '@prisma/client'

type Props = {
  form: UseFormReturn<ProfileDataInput>
}

export function SectionProfessionalInfo({ form }: Props) {
  const t = useTranslations('profile')
  const t_assets = useTranslations('assets')

  const workStatus = form.watch('professionalInfo.workStatus')
  const showEmployerFields = workStatus === WorkStatus.EMPLOYEE
  const showProfessionField = workStatus === WorkStatus.EMPLOYEE || workStatus === WorkStatus.ENTREPRENEUR

  return (
    <div className="space-y-6">
      {/* Statut professionnel */}
      <div>
        <FormField
          control={form.control}
          name="professionalInfo.workStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.work_status')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('placeholders.select_work_status')} />
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
      </div>

      {/* Champs additionnels selon le statut */}
      {(showProfessionField || showEmployerFields) && (
        <div className="space-y-4">
          {showProfessionField && (
            <FormField
              control={form.control}
              name="professionalInfo.profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labels.profession')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('placeholders.profession')} />
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
                name="professionalInfo.employer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('labels.employer')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('placeholders.employer')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professionalInfo.employerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('labels.employer_address')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('placeholders.employer_address')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
      )}

      {/* Activité au Gabon */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">{t('labels.gabon_activity')}</h3>
          <FormDescription>
            {t('descriptions.gabon_activity')}
          </FormDescription>
        </div>

        <FormField
          control={form.control}
          name="professionalInfo.lastActivityGabon"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder={t('placeholders.gabon_activity')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}