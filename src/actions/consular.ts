import { ConsularFormData } from '@/types'
import { ActionResult } from '@/lib/auth/action'
import { getTranslations } from 'next-intl/server'
import { BasicInfoSchema, ContactInfoSchema, FamilyInfoSchema, ProfessionalInfoSchema } from '@/schemas/registration'
import { db } from '@/lib/prisma'
import { z } from 'zod'

export async function submitConsularForm(
  formData: ConsularFormData
): Promise<ActionResult<{ id: string }>> {
  const t = await getTranslations('errors')

  try {
    // Validation des données
    const validatedBasicInfo = BasicInfoSchema.parse(formData.basicInfo)
    const validatedContactInfo = ContactInfoSchema.parse(formData.contactInfo)
    const validatedFamilyInfo = FamilyInfoSchema.parse(formData.familyInfo)
    const validatedProfessionalInfo = ProfessionalInfoSchema.parse(formData.professionalInfo)

    // Création du profil dans la base de données
    const profile = await db.profile.create({
      data: {
        ...validatedBasicInfo,
        ...validatedContactInfo,
        ...validatedFamilyInfo,
        ...validatedProfessionalInfo,
        // Autres champs nécessaires...
      }
    })

    return {
      data: {
        id: profile.id
      }
    }

  } catch (error) {
    console.error('Consular form submission error:', error)

    if (error instanceof z.ZodError) {
      // Erreur de validation
      return {
        error: t('validation.invalid_data')
      }
    }

    return {
      error: t('common.unknown_error')
    }
  }
}