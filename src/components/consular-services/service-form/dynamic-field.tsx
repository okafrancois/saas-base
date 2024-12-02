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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'

interface FieldConfig extends FieldValues {
  name: string
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'date' | 'email' | 'tel'
  label: string
  description?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: string
    max?: string
  }
}

interface DynamicFieldProps {
  field: FieldConfig
  form: UseFormReturn<FieldConfig>
}

export function DynamicField({ field, form }: DynamicFieldProps) {
  const t = useTranslations('consular.services.form')

  const renderFieldControl = () => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            onValueChange={value => form.setValue(field.name, value)}
            defaultValue={form.getValues(field.name)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('select_placeholder')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
        return (
          <RadioGroup
            onValueChange={value => form.setValue(field.name, value)}
            defaultValue={form.getValues(field.name)}
          >
            {field.options?.map(option => (
              <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value={option.value} />
                </FormControl>
                <FormLabel className="font-normal">
                  {option.label}
                </FormLabel>
              </FormItem>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <FormControl>
            <Checkbox
              checked={form.getValues(field.name)}
              onCheckedChange={value => form.setValue(field.name, value)}
            />
          </FormControl>
        )

      case 'textarea':
        return (
          <FormControl>
            <Textarea
              {...form.register(field.name)}
              placeholder={t('enter_text')}
            />
          </FormControl>
        )

      case 'date':
        return (
          <FormControl>
            <Input
              {...form.register(field.name)}
              type="date"
              placeholder={t('select_date')}
            />
          </FormControl>
        )

      case 'email':
        return (
          <FormControl>
            <Input
              {...form.register(field.name)}
              type="email"
              placeholder={t('enter_email')}
            />
          </FormControl>
        )

      case 'tel':
        return (
          <FormControl>
            <Input
              {...form.register(field.name)}
              type="tel"
              placeholder={t('enter_phone')}
            />
          </FormControl>
        )

      default:
        return (
          <FormControl>
            <Input
              {...form.register(field.name)}
              placeholder={t('enter_text')}
            />
          </FormControl>
        )
    }
  }

  return (
    <FormField
      control={form.control}
      name={field.name}
      render={() => (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          {renderFieldControl()}
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}