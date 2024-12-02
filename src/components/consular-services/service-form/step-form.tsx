'use client'
import { useTranslations } from 'next-intl'
import { ServiceStep } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { DynamicField } from './dynamic-field'

interface StepFormProps {
  step: ServiceStep
  onSubmit: (data: any) => void
  defaultValues?: any
}

export function StepForm({
                           step,
                           onSubmit,
                           defaultValues
                         }: StepFormProps) {
  const t = useTranslations('consular.services.form')
  const form = useForm({
    defaultValues: defaultValues || {}
  })

  const fields = JSON.parse(step.fields as string)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          {fields.map((field: any) => (
            <DynamicField
              key={field.name}
              field={field}
              form={form}
            />
          ))}
        </div>
      </form>
    </Form>
  )
}