'use client'
import { useTranslations } from 'next-intl'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FieldConfig {
  name: string
  type: 'text' | 'email' | 'tel' | 'date' | 'select'
  label: string
  description?: string
  required?: boolean
  options?: { value: string; label: string }[]
}

interface DynamicFieldProps<T extends FieldValues> {
  field: FieldConfig
  form: UseFormReturn<T>
  isPreFilled?: boolean
  disabled?: boolean
}

export function DynamicField({
                               field,
                               form,
                               isPreFilled,
                               disabled
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                             }: DynamicFieldProps<any>) {
  const t = useTranslations('consular.services.form')

  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel className={cn(isPreFilled && "text-muted-foreground")}>
              {field.label}
            </FormLabel>
            {isPreFilled && (
              <Badge variant="outline" className="text-xs">
                {t('prefilled')}
              </Badge>
            )}
          </div>

          <FormControl>
            <Input
              {...formField}
              type={field.type}
              disabled={disabled}
              className={cn(
                isPreFilled && "bg-muted text-muted-foreground"
              )}
            />
          </FormControl>

          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}