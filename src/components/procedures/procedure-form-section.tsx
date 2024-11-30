'use client'

import { useTranslations } from 'next-intl'
import { ProcedureFormSection as ProcedureFormSectionType, ProcedureFieldType } from '@/types/procedure'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProcedureFormSectionProps {
  section: ProcedureFormSectionType
  form: UseFormReturn<any>
}

export function ProcedureFormSection({ section, form }: ProcedureFormSectionProps) {
  const t = useTranslations('procedures')

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        {t(`form.sections.${section.section}.title`)}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {section.fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {t(`form.fields.${field.name}`)}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  {field.type === ProcedureFieldType.SELECT ? (
                    <Select
                      onValueChange={formField.onChange}
                      defaultValue={formField.value}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(`form.fields.${field.name}_placeholder`)}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {t(`form.options.${option.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      {...formField}
                      type={field.type}
                      placeholder={t(`form.fields.${field.name}_placeholder`)}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
}