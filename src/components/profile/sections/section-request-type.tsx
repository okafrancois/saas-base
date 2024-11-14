import { UseFormReturn } from 'react-hook-form'
import { ProfileDataInput } from '@/components/consular/schema'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTranslations } from 'next-intl'
import { DocumentType, NationalityAcquisition } from '@prisma/client'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

type Props = {
  form: UseFormReturn<ProfileDataInput>
}

export function SectionRequestType({ form }: Props) {
  const t = useTranslations('profile')

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="requestType.documentType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>{t('labels.document_type')}</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={DocumentType.FIRST_REQUEST} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {t('labels.first_request')}
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={DocumentType.RENEWAL} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {t('labels.renewal')}
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={DocumentType.MODIFICATION} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {t('labels.modification')}
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requestType.nationalityAcquisition"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>{t('labels.nationality_acquisition')}</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={NationalityAcquisition.BIRTH} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {t('labels.nationality_birth')}
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={NationalityAcquisition.NATURALIZATION} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {t('labels.nationality_naturalization')}
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={NationalityAcquisition.MARRIAGE} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {t('labels.nationality_marriage')}
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={NationalityAcquisition.OTHER} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {t('labels.nationality_other')}
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}