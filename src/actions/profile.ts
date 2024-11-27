'use server'

import { z } from "zod"
import { validateForm } from "@/lib/form"
import { getTranslations } from 'next-intl/server'
import { ActionResult, checkAuth } from '@/lib/auth/action'
import { Profile, User } from '@prisma/client'
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
import { ProfileAction, ProfileStats } from '@/types'
import { getDocumentStats } from '@/lib/db/document'

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

export async function getProfileActions(): Promise<ProfileAction[]> {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const profile = await db.profile.findUnique({
      where: { userId: user.id }
    })

    const actions: ProfileAction[] = []

    // Logique pour déterminer les actions nécessaires
    if (!profile) {
      actions.push({
        id: 'complete-profile',
        label: 'complete_profile',
        description: 'complete_profile_description',
        status: 'pending',
        priority: 'high'
      })
    }

    // Ajouter d'autres vérifications selon les besoins

    return actions
  } catch (error) {
    console.error('Error fetching profile actions:', error)
    return []
  }
}

export async function getProfileStats(): Promise<ProfileStats | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const [documentStats, requestsCount] = await Promise.all([
      getDocumentStats(user.id),
      db.request.count({
        where: {
          userId: user.id,
          status: { in: ['PENDING', 'INCOMPLETE'] }
        }
      })
    ])

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      include: { address: true }
    })

    return {
      documentsCount: documentStats.total,
      documentsValidated: documentStats.validated,
      documentsPending: documentStats.pending,
      documentsExpired: documentStats.expired,
      requestsCount,
      lastLogin: user.lastLogin ?? undefined,
      profileCompletion: calculateProfileCompletion(profile)
    }
  } catch (error) {
    console.error('Error fetching profile stats:', error)
    return null
  }
}

function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0

  const fields = {
    required: [
      'firstName',
      'lastName',
      'birthDate',
      'nationality',
      'gender'
    ],
    optional: [
      'phone',
      'profession',
      'address'
    ]
  }

  const requiredScore = fields.required.filter(f => !!profile[f]).length * 2
  const optionalScore = fields.optional.filter(f => !!profile[f]).length

  const maxScore = (fields.required.length * 2) + fields.optional.length
  const currentScore = requiredScore + optionalScore

  return Math.round((currentScore / maxScore) * 100)
}

type UpdateProfileSection = {
  basicInfo?: BasicInfoFormData
  contactInfo?: ContactInfoFormData
  familyInfo?: FamilyInfoFormData
  professionalInfo?: ProfessionalInfoFormData
}

export async function updateProfile(
  formData: FormData,
  section: keyof UpdateProfileSection
): Promise<ActionResult<Profile>> {
  try {
    const t = await getTranslations('messages.profile.errors')
    const user = await getCurrentUser()

    if (!user) {
      return { error: t('unauthorized') }
    }

    // Récupérer le profil existant
    const existingProfile = await db.profile.findUnique({
      where: { userId: user.id },
      include: {
        address: true,
        addressInGabon: true,
        emergencyContact: true,
      }
    })

    if (!existingProfile) {
      return { error: t('profile_not_found') }
    }

    // Traiter les fichiers si présents
    const fileProcessingPromises: Promise<any>[] = []
    const files = {
      identityPictureFile: formData.get('identityPictureFile') as File,
      passportFile: formData.get('passportFile') as File,
      birthCertificateFile: formData.get('birthCertificateFile') as File,
      residencePermitFile: formData.get('residencePermitFile') as File,
      addressProofFile: formData.get('addressProofFile') as File,
    }

    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        fileProcessingPromises.push(processFileData(file))
      }
    })

    const processedFiles = await Promise.all(fileProcessingPromises)

    // Récupérer les données JSON de la section
    const sectionData = formData.get(section)
    if (!sectionData) {
      return { error: t('invalid_data') }
    }

    const data = JSON.parse(sectionData as string)

    // Préparer les données de mise à jour en fonction de la section
    let updateData: any = {}

    switch (section) {
      case 'basicInfo':
        updateData = {
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          birthDate: data.birthDate,
          birthPlace: data.birthPlace,
          birthCountry: data.birthCountry,
          nationality: data.nationality,
          acquisitionMode: data.acquisitionMode,
          passportNumber: data.passportNumber,
          passportIssueDate: new Date(data.passportIssueDate),
          passportExpiryDate: new Date(data.passportExpiryDate),
          passportIssueAuthority: data.passportIssueAuthority,
          ...(processedFiles[0] && { identityPicture: processedFiles[0].url }),
        }
        break

      case 'contactInfo':
        updateData = {
          email: data.email,
          phone: data.phone,
          address: {
            upsert: {
              create: data.address,
              update: data.address,
            },
          },
          ...(data.addressInGabon && {
            addressInGabon: {
              upsert: {
                create: data.addressInGabon,
                update: data.addressInGabon,
              },
            },
          }),
        }
        break

      case 'familyInfo':
        const emergencyContact = {
          fullName: data.emergencyContact.fullName,
          relationship: data.emergencyContact.relationship,
          phone: data.emergencyContact.phone
        }
        updateData = {
          maritalStatus: data.maritalStatus,
          fatherFullName: data.fatherFullName,
          motherFullName: data.motherFullName,
          spouseFullName: data.spouseFullName,
          ...(data.emergencyContact && {
            emergencyContact: {
              upsert: {
                create: emergencyContact,
                update: emergencyContact,
              },
            },
          }),
        }
        break

      case 'professionalInfo':
        updateData = {
          workStatus: data.workStatus,
          profession: data.profession,
          employer: data.employer,
          employerAddress: data.employerAddress,
          activityInGabon: data.lastActivityGabon,
        }
        break

      default:
        return { error: t('invalid_section') }
    }

    // Mettre à jour le profil
    const updatedProfile = await db.profile.update({
      where: { id: existingProfile.id },
      data: updateData,
      include: {
        address: true,
        addressInGabon: true,
        emergencyContact: true,
      }
    })

    // Revalider les pages qui affichent ces données
    revalidatePath(PAGE_ROUTES.profile)
    revalidatePath(PAGE_ROUTES.dashboard)

    return { data: updatedProfile }
  } catch (error) {
    console.error('Update profile error:', error)
    return {
      error: error instanceof Error ? error.message : 'messages.errors.unknown_error'
    }
  }
}