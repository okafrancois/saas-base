// src/components/procedures/procedure-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { ConsularProcedure } from '@/types/procedure'
import { Profile } from '@prisma/client'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { generateProcedureSchema } from '@/lib/procedures/schema'
import { ProcedureFormSection } from './procedure-form-section'
import { useRouter } from 'next/navigation'
import { PAGE_ROUTES } from '@/schemas/app-routes'

interface ProcedureFormProps {
  procedure: ConsularProcedure
  profile: Profile | null
}

export function ProcedureForm({ procedure, profile }: ProcedureFormProps) {
  const t = useTranslations('procedures')
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const schema = generateProcedureSchema(procedure)
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      // Pré-remplir avec les données du profil si disponibles
      ...profile
    }
  })

  const sections = procedure.formSections || []
  const isLastSection = currentSection === sections.length - 1

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      // TODO: Implémenter la soumission du formulaire

      router.push(PAGE_ROUTES.procedures)
    } catch (error) {
      console.error('Error submitting procedure:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          {sections[currentSection] && (
            <ProcedureFormSection
              section={sections[currentSection]}
              form={form}
            />
          )}
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (currentSection > 0) {
                setCurrentSection(prev => prev - 1)
              } else {
                router.back()
              }
            }}
          >
            {t('form.previous')}
          </Button>

          <Button
            type={isLastSection ? 'submit' : 'button'}
            disabled={isSubmitting}
            onClick={() => {
              if (!isLastSection) {
                setCurrentSection(prev => prev + 1)
              }
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t('actions.submitting')}
              </span>
            ) : isLastSection ? (
              t('actions.submit')
            ) : (
              t('form.next')
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}