'use server'

import { getTranslations } from 'next-intl/server'
import { ActionResult } from '@/lib/auth/action'
import { DocumentType, Profile } from '@prisma/client'
import { db } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { getCurrentUser } from '@/actions/user'
import { processFileData } from '@/actions/utils'
import {
  BasicInfoFormData,
  ContactInfoFormData, DocumentsFormData,
  FamilyInfoFormData,
  ProfessionalInfoFormData,
} from '@/schemas/registration'
import { deleteFiles } from '@/actions/uploads'

export async function postProfile(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const uploadedFiles: { key: string; url: string }[] = []

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

    // Garder une trace des fichiers uploadés pour pouvoir les supprimer en cas d'erreur
    if (identityPicture) uploadedFiles.push(identityPicture)
    if (passport) uploadedFiles.push(passport)
    if (birthCertificate) uploadedFiles.push(birthCertificate)
    if (residencePermit) uploadedFiles.push(residencePermit)
    if (addressProof) uploadedFiles.push(addressProof)

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

      const address = await tx.address.create({
        data: contactInfo.address
      })

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

          // Documents

          // Informations professionnelles
          workStatus: professionalInfo.workStatus,
          profession: professionalInfo.profession || null,
          employer: professionalInfo.employer || null,
          employerAddress: professionalInfo.employerAddress || null,
          activityInGabon: professionalInfo.lastActivityGabon,

          // Relations
          addressId: address.id,
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
        const passportDoc = await tx.document.create({
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

        // Mettre à jour le profil avec le document du passeport
        await tx.profile.update({
          where: { id: profile.id },
          data: {
            passportId: passportDoc.id
          }
        })
      }

      // Créer les autres documents si présents
      if (birthCertificate) {
        const birthCertificateDoc = await tx.document.create({
          data: {
            type: DocumentType.BIRTH_CERTIFICATE,
            fileUrl: birthCertificate.url,
            profileId: profile.id
          }
        })

        // Mettre à jour le profil avec le document du certificat de naissance
        await tx.profile.update({
          where: { id: profile.id },
          data: {
            birthCertificateId: birthCertificateDoc.id
          }
        })
      }

      if (residencePermit) {
        const residencePermitDoc = await tx.document.create({
          data: {
            type: DocumentType.RESIDENCE_PERMIT,
            fileUrl: residencePermit.url,
            issuedAt: now,
            expiresAt: inOneYear,
            profileId: profile.id
          }
        })

        // Mettre à jour le profil avec le document du titre de séjour
        await tx.profile.update({
          where: { id: profile.id },
          data: {
            residencePermitId: residencePermitDoc.id
          }
        })
      }

      if (addressProof) {
        const addressProofDoc = await tx.document.create({
          data: {
            type: DocumentType.PROOF_OF_ADDRESS,
            fileUrl: addressProof.url,
            issuedAt: now,
            expiresAt: inThreeMonths,
            profileId: profile.id
          }
        })

        // Mettre à jour le profil avec le document de justificatif de domicile
        await tx.profile.update({
          where: { id: profile.id },
          data: {
            addressProofId: addressProofDoc.id
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
    if (uploadedFiles.length > 0) {
      try {
        await deleteFiles(uploadedFiles.map(file => file.key))
      } catch (deleteError) {
        console.error('Error deleting files:', deleteError)
      }
    }

    console.error('Profile creation error:', error)
    return {
      error: error instanceof Error ? error.message : 'messages.errors.unknown_error'
    }
  }
}

type UpdateProfileSection = {
  basicInfo?: BasicInfoFormData
  contactInfo?: ContactInfoFormData
  familyInfo?: FamilyInfoFormData
  professionalInfo?: ProfessionalInfoFormData
  documents?: DocumentsFormData
}

/**
type DocumentUpdate = {
  fileUrl: string
  type: DocumentType
  status?: DocumentStatus
  issuedAt?: Date
  expiresAt?: Date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
}*/

export async function updateProfile(
  formData: FormData,
  section: keyof UpdateProfileSection
): Promise<ActionResult<Profile>> {
  const uploadedFiles: { key: string; url: string }[] = []

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileProcessingPromises: Promise<any>[] = []
    const files = {
      identityPictureFile: formData.get('identityPictureFile') as File,
      passportFile: formData.get('passportFile') as File,
      birthCertificateFile: formData.get('birthCertificateFile') as File,
      residencePermitFile: formData.get('residencePermitFile') as File,
      addressProofFile: formData.get('addressProofFile') as File,
    }

    Object.entries(files).forEach(file => {
      if (file) {
        const formData = new FormData()
        formData.append('files', file[0])
        fileProcessingPromises.push(processFileData(formData))
      }
    })

    const processedFiles = await Promise.all(fileProcessingPromises)

    // Garder une trace des fichiers uploadés pour pouvoir les supprimer en cas d'erreur
    processedFiles.forEach(file => {
      if (file) uploadedFiles.push(file)
    })

    // Récupérer les données JSON de la section
    const sectionData = formData.get(section)
    if (!sectionData) {
      return { error: t('invalid_data') }
    }

    const data = JSON.parse(sectionData as string)

    // Préparer les données de mise à jour en fonction de la section
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    if (uploadedFiles.length > 0) {
      try {
        await deleteFiles(uploadedFiles.map(file => file.key))
      } catch (deleteError) {
        console.error('Error deleting files:', deleteError)
      }
    }

    console.error('Update profile error:', error)
    return {
      error: error instanceof Error ? error.message : 'messages.errors.unknown_error'
    }
  }
}