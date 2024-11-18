'use server'

import { z } from "zod"
import { validateForm } from "@/lib/form"
import { getTranslations } from 'next-intl/server'
import { ActionResult, checkAuth } from '@/lib/auth/action'
import { User } from '@prisma/client'
import { db } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PAGE_ROUTES } from '@/schemas/app-routes'

const UpdateProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email()
})

export async function handleProfileUpdate(
  formData: FormData
): Promise<ActionResult<User>> {
  const t = await getTranslations('errors')
  // Vérifier l'auth
  const authResult = await checkAuth()
  if (authResult.error) return { error: authResult.error }

  // Valider les données
  const validationResult = await validateForm(UpdateProfileSchema, formData)
  if (validationResult.error) return { error: validationResult.error }

  if (!authResult.user?.id) return { error: t('auth.user_not_found') }


  try {
    const updated = await db.user.update({
      where: { id: authResult.user.id },
      data: {
        name: `${validationResult.data?.firstName} ${validationResult.data?.lastName}`,
        email: validationResult.data?.email,
      }
    })

    revalidatePath(PAGE_ROUTES.profile)
    return { data: updated }
  } catch (error) {
    console.error(t('auth.update_profile'), error)
    return { error: t('common.unknown_error') }
  }
}