'use client'

import { useTranslations } from 'next-intl'
import { ProcedureStep } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { DynamicField } from './dynamic-field'

interface StepFormProps {
  step: ProcedureStep
  onSubmit: (data: any) => void
  defaultValues?: any
}

export function StepForm({
                           step,
                           onSubmit,
                           defaultValues
                         }: StepFormProps) {
  const t = useTranslations('procedures.form')
  const form = useForm({
    defaultValues: defaultValues || {}
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fields = step.fields as any[]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          {fields.map((field) => (
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