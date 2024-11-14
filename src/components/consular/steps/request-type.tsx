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
import { useTranslations } from 'next-intl'
import { DocumentType, NationalityAcquisition } from '@prisma/client'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { RequestTypeFormData, RequestTypeSchema } from '@/components/consular/schema'

interface RequestTypeFormProps {
  onSubmit: (data: RequestTypeFormData) => void
  defaultValues?: Partial<RequestTypeFormData>
  formRef?: React.RefObject<HTMLFormElement>
  isLoading?: boolean
}

export function RequestTypeForm({ onSubmit, defaultValues, formRef }: Readonly<RequestTypeFormProps>) {
  const t = useTranslations('consular_registration')

  const form = useForm<RequestTypeFormData>({
    resolver: zodResolver(RequestTypeSchema),
    defaultValues: defaultValues || {
      documentType: DocumentType.FIRST_REQUEST,
      nationalityAcquisition: NationalityAcquisition.BIRTH,
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
  })

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Type de demande */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">
                    {t('request_type.type.label')}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={DocumentType.FIRST_REQUEST} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('request_type.type.first_request')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={DocumentType.RENEWAL} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('request_type.type.renewal')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={DocumentType.MODIFICATION} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('request_type.type.modification')}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Mode d'acquisition de la nationalité */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="nationalityAcquisition"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">
                    {t('request_type.nationality.label')}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={NationalityAcquisition.BIRTH} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('request_type.nationality.birth')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={NationalityAcquisition.NATURALIZATION} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('request_type.nationality.naturalization')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={NationalityAcquisition.MARRIAGE} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('request_type.nationality.marriage')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={NationalityAcquisition.OTHER} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('request_type.nationality.other')}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
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