// src/lib/procedures/schema.ts
import { z } from 'zod'
import { ConsularProcedure, ProcedureFieldType } from '@/types/procedure'

export function generateProcedureSchema(procedure: ConsularProcedure) {
  const schema: Record<string, any> = {}

  procedure.formSections?.forEach(section => {
    section.fields.forEach(field => {
      let fieldSchema = z.string()

      if (field.required) {
        fieldSchema = fieldSchema.min(1, 'messages.errors.required')
      } else {
        fieldSchema = fieldSchema.optional()
      }

      // Ajouter des validations spécifiques selon le type
      switch (field.type) {
        case ProcedureFieldType.EMAIL:
          fieldSchema = fieldSchema.email('messages.errors.invalid_email')
          break
        case ProcedureFieldType.TEL:
          fieldSchema = z.string().refine(
            (val) => /^\+?[1-9]\d{1,14}$/.test(val),
            {
              message: 'messages.errors.invalid_phone'
            }
          )
          break
        case ProcedureFieldType.DATE:
          fieldSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'messages.errors.invalid_date',
          })
          break
      }

      schema[field.name] = fieldSchema
    })
  })

  return z.object(schema)
}