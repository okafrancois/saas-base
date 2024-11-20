'use server'

import { z } from "zod"
import { validateForm } from "@/lib/form"
import { getTranslations } from 'next-intl/server'
import { ActionResult, checkAuth } from '@/lib/auth/action'
import { User } from '@prisma/client'
import { db } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { getCurrentUser } from '@/actions/user'
import { processFileData } from '@/actions/utils'
import {
  BasicInfoFormData,
  ContactInfoFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration'

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

export async function postProfile(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const t = await getTranslations('errors')
    const user = await getCurrentUser()

    if (!user) {
      return { error: t('auth.unauthorized') }
    }

    // Traiter les fichiers uploadés
    const [
      identityPicture,
      passport,
      birthCertificate,
      residencePermit,
      addressProof
    ] = await Promise.all([
      processFileData(formData.get('identityPictureFile') as File),
      processFileData(formData.get('passportFile') as File),
      processFileData(formData.get('birthCertificateFile') as File),
      processFileData(formData.get('residencePermitFile') as File),
      processFileData(formData.get('addressProofFile') as File)
    ])

    // Récupérer et parser les données du formulaire
    const basicInfo: BasicInfoFormData = JSON.parse(formData.get('basicInfo') as string)
    const contactInfo: ContactInfoFormData = JSON.parse(formData.get('contactInfo') as string)
    const familyInfo: FamilyInfoFormData = JSON.parse(formData.get('familyInfo') as string)
    const professionalInfo: ProfessionalInfoFormData = JSON.parse(formData.get('professionalInfo') as string)

    // Créer ou mettre à jour le profil
    const profile = await db.profile.upsert({
      where: {
        userId: user.id
      },
      create: {
        userId: user.id,
        // Informations de base
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName,
        gender: basicInfo.gender,
        birthDate: basicInfo.birthDate,
        birthPlace: basicInfo.birthPlace,
        birthCountry: basicInfo.birthCountry,
        nationality: basicInfo.nationality,
        acquisitionMode: basicInfo.acquisitionMode,

        // Documents
        identityPicture: identityPicture?.url,
        passport: passport?.url,
        birthCertificate: birthCertificate?.url,
        residencePermit: residencePermit?.url,
        addressProof: addressProof?.url,

        // Informations passeport
        passportNumber: basicInfo.passportNumber,
        passportIssueDate: new Date(basicInfo.passportIssueDate),
        passportExpiryDate: new Date(basicInfo.passportExpiryDate),
        passportIssueAuthority: basicInfo.passportIssueAuthority,

        // Informations familiales
        maritalStatus: familyInfo.maritalStatus,
        fatherFullName: familyInfo.fatherFullName,
        motherFullName: familyInfo.motherFullName,
        spouseFullName: familyInfo.spouseFullName,

        // Contact d'urgence
        emergencyContact: {
          create: familyInfo.emergencyContact
        },

        // Informations professionnelles
        workStatus: professionalInfo.workStatus,
        profession: professionalInfo.profession,
        employer: professionalInfo.employer,
        employerAddress: professionalInfo.employerAddress,
        activityInGabon: professionalInfo.lastActivityGabon,

        // Adresse principale
        address: {
          create: contactInfo.address
        },

        // Adresse au Gabon si fournie
        addressInGabon: contactInfo.addressInGabon ? {
          create: contactInfo.addressInGabon
        } : undefined,

        // Contact
        phone: contactInfo.phone,
        email: contactInfo.email,

        // Statut initial
        status: 'PENDING'
      },
      update: {
        // Mêmes champs que create, mais avec update pour les relations
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName,
        gender: basicInfo.gender,
        birthDate: basicInfo.birthDate,
        birthPlace: basicInfo.birthPlace,
        birthCountry: basicInfo.birthCountry,
        nationality: basicInfo.nationality,
        acquisitionMode: basicInfo.acquisitionMode,

        identityPicture: identityPicture?.url || undefined,
        passport: passport?.url || undefined,
        birthCertificate: birthCertificate?.url || undefined,
        residencePermit: residencePermit?.url || undefined,
        addressProof: addressProof?.url || undefined,

        passportNumber: basicInfo.passportNumber,
        passportIssueDate: new Date(basicInfo.passportIssueDate),
        passportExpiryDate: new Date(basicInfo.passportExpiryDate),
        passportIssueAuthority: basicInfo.passportIssueAuthority,

        maritalStatus: familyInfo.maritalStatus,
        fatherFullName: familyInfo.fatherFullName,
        motherFullName: familyInfo.motherFullName,
        spouseFullName: familyInfo.spouseFullName,

        emergencyContact: {
          upsert: {
            create: familyInfo.emergencyContact,
            update: familyInfo.emergencyContact
          }
        },

        workStatus: professionalInfo.workStatus,
        profession: professionalInfo.profession,
        employer: professionalInfo.employer,
        employerAddress: professionalInfo.employerAddress,
        activityInGabon: professionalInfo.lastActivityGabon,

        address: {
          upsert: {
            create: contactInfo.address,
            update: contactInfo.address
          }
        },

        addressInGabon: contactInfo.addressInGabon ? {
          upsert: {
            create: contactInfo.addressInGabon,
            update: contactInfo.addressInGabon
          }
        } : undefined,

        phone: contactInfo.phone,
        email: contactInfo.email,
      },
      include: {
        address: true,
        addressInGabon: true,
        emergencyContact: true
      }
    })

    // Revalider les pages qui pourraient afficher ces données
    revalidatePath(PAGE_ROUTES.profile)
    revalidatePath(PAGE_ROUTES.dashboard)

    return { data: { id: profile.id } }

  } catch (error) {
    console.error('messages.errors.unknown_error', error)
    return {
      error: error instanceof Error
        ? error.message
        : 'messages.errors.unknown_error'
    }
  }
}