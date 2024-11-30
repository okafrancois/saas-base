'use server'

import { getTranslations } from 'next-intl/server'
import { ActionResult } from '@/lib/auth/action'
import { DocumentStatus, DocumentType, Profile } from '@prisma/client'
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

export async function postProfile(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const t = await getTranslations('messages.profile')
    const user = await getCurrentUser()

    if (!user) {
      return { error: t('errors.unauthorized') }
    }

    const filesPromises = []

    const identityPictureFile = formData.get('identityPictureFile') as File

    if (identityPictureFile) {
      const formData = new FormData()
      formData.append('files', identityPictureFile)
      filesPromises.push(processFileData(formData))
    }

    const passportFile = formData.get('passportFile') as File

    if (passportFile) {
      const formData = new FormData()
      formData.append('files', passportFile)
      filesPromises.push(processFileData(formData))
    }

    const birthCertificateFile = formData.get('birthCertificateFile') as File

    if (birthCertificateFile) {
      const formData = new FormData()
      formData.append('files', birthCertificateFile)
      filesPromises.push(processFileData(formData))
    }

    const residencePermitFile = formData.get('residencePermitFile') as File

    if (residencePermitFile) {
      const formData = new FormData()
      formData.append('files', residencePermitFile)
      filesPromises.push(processFileData(formData))
    }

    const addressProofFile = formData.get('addressProofFile') as File

    if (addressProofFile) {
      const formData = new FormData()
      formData.append('files', addressProofFile)
      filesPromises.push(processFileData(formData))
    }

    // Traiter les fichiers uploadés
    const [
      identityPicture,
      passport,
      birthCertificate,
      residencePermit,
      addressProof
    ] = await Promise.all(filesPromises)

    // Récupérer et parser les données du formulaire
    const basicInfo = JSON.parse(formData.get('basicInfo') as string)
    const contactInfo = JSON.parse(formData.get('contactInfo') as string)
    const familyInfo = JSON.parse(formData.get('familyInfo') as string)
    const professionalInfo = JSON.parse(formData.get('professionalInfo') as string)

    // Créer le profil avec une transaction
    const profile = await db.$transaction(async (tx) => {
      // 1. Créer le profil avec toutes ses relations

      const now = new Date()
      const inThreeMonths = new Date(now.setMonth(now.getMonth() + 3))
      const inOneYear = new Date(now.setFullYear(now.getFullYear() + 1))
      const inFiveYears = new Date(now.setFullYear(now.getFullYear() + 5))

      const profile = await tx.profile.create({
        data: {
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
          identityPicture: identityPicture?.url,

          // Informations passeport
          passportNumber: basicInfo.passportNumber,
          passportIssueDate: new Date(basicInfo.passportIssueDate),
          passportExpiryDate: new Date(basicInfo.passportExpiryDate),
          passportIssueAuthority: basicInfo.passportIssueAuthority,

          // Informations familiales
          maritalStatus: familyInfo.maritalStatus,
          fatherFullName: familyInfo.fatherFullName,
          motherFullName: familyInfo.motherFullName,
          spouseFullName: familyInfo.spouseFullName || null,

          // Contact
          phone: contactInfo.phone,
          email: contactInfo.email,

          // Informations professionnelles
          workStatus: professionalInfo.workStatus,
          profession: professionalInfo.profession || null,
          employer: professionalInfo.employer || null,
          employerAddress: professionalInfo.employerAddress || null,
          activityInGabon: professionalInfo.lastActivityGabon,

          // Relations
          address: contactInfo.address ? {
            create: contactInfo.address
          } : undefined,
          addressInGabon: contactInfo.addressInGabon ? {
            create: contactInfo.addressInGabon
          } : undefined,
          emergencyContact: familyInfo.emergencyContact ? {
            create: familyInfo.emergencyContact
          } : undefined
        }
      })

      // 2. Créer les documents associés
      if (passport) {
        await tx.document.create({
          data: {
            type: DocumentType.PASSPORT,
            fileUrl: passport.url,
            profileId: profile.id,
            issuedAt: new Date(basicInfo.passportIssueDate),
            expiresAt: new Date(basicInfo.passportExpiryDate ?? inFiveYears),
            metadata: {
              documentNumber: basicInfo.passportNumber,
              issuingAuthority: basicInfo.passportIssueAuthority
            }
          }
        })
      }

      // Créer les autres documents si présents
      if (birthCertificate) {
        await tx.document.create({
          data: {
            type: DocumentType.BIRTH_CERTIFICATE,
            fileUrl: birthCertificate.url,
            profileId: profile.id
          }
        })
      }

      if (residencePermit) {
        await tx.document.create({
          data: {
            type: DocumentType.RESIDENCE_PERMIT,
            fileUrl: residencePermit.url,
            issuedAt: now,
            expiresAt: inOneYear,
            profileId: profile.id
          }
        })
      }

      if (addressProof) {
        await tx.document.create({
          data: {
            type: DocumentType.PROOF_OF_ADDRESS,
            fileUrl: addressProof.url,
            issuedAt: now,
            expiresAt: inThreeMonths,
            profileId: profile.id
          }
        })
      }

      return profile
    })

    // Revalider les pages
    revalidatePath(PAGE_ROUTES.profile)
    revalidatePath(PAGE_ROUTES.dashboard)

    return { data: { id: profile.id } }

  } catch (error) {
    console.error('Profile creation/update error:', error)
    return {
      error: error instanceof Error ? error.message : 'messages.errors.unknown_error'
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
  documents?: any
}

type DocumentUpdate = {
  fileUrl: string
  type: DocumentType
  status?: DocumentStatus
  issuedAt?: Date
  expiresAt?: Date
  metadata?: any
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

    // Si c'est une mise à jour de documents
    if (section === 'documents') {
      const documentUpdates: DocumentUpdate[] = []

      // Traiter chaque type de document possible
      const documentTypes = [
        'passportFile',
        'birthCertificateFile',
        'residencePermitFile',
        'addressProofFile'
      ]

      for (const docType of documentTypes) {
        const file = formData.get(docType) as File
        if (file) {
          const processedFile = await processFileData(file)
          if (processedFile) {
            documentUpdates.push({
              fileUrl: processedFile.url,
              type: docType.replace('File', '').toUpperCase() as DocumentType,
              status: DocumentStatus.PENDING,
              issuedAt: new Date(),
              // Pour le passeport et le titre de séjour, on ajoute une date d'expiration
              ...(docType === 'passportFile' || docType === 'residencePermitFile' ? {
                expiresAt: new Date(formData.get(`${docType}ExpiryDate`) as string),
                metadata: {
                  documentNumber: formData.get(`${docType}Number`),
                  issuingAuthority: formData.get(`${docType}Authority`),
                }
              } : {})
            })
          }
        }
      }

      // Mise à jour ou création des documents
      const updatePromises = documentUpdates.map(async (doc) => {
        return db.document.upsert({
          where: {
            profileId_type: {
              profileId: user.id,
              type: doc.type
            }
          },
          create: {
            ...doc,
            profileId: user.id
          },
          update: {
            ...doc
          }
        })
      })

      await Promise.all(updatePromises)

      // Récupérer le profil mis à jour avec les documents
      const updatedProfile = await db.profile.findUnique({
        where: { userId: user.id },
        include: {
          documents: true,
          passport: true,
          birthCertificate: true,
          residencePermit: true,
          addressProof: true,
          address: true,
          addressInGabon: true,
          emergencyContact: true,
        }
      })

      if (!updatedProfile) {
        return { error: t('profile_not_found') }
      }

      // Revalider les pages
      revalidatePath(PAGE_ROUTES.profile)
      revalidatePath(PAGE_ROUTES.dashboard)
      revalidatePath(PAGE_ROUTES.documents)

      return { data: updatedProfile }
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