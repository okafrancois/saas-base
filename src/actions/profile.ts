'use server'

import { db } from '@/lib/prisma'
import { getCurrentUserOrThrow } from '@/actions/user'
import { Prisma, Profile, User } from '@prisma/client'
import { processFileData } from '@/actions/utils'
import { FullProfile } from '@/lib/models-types'
import { notFound } from 'next/navigation'
import {
  ProfileDataPostInput,
  ProfileDataPostSchema,
} from '@/components/consular/schema'
import { deleteFiles } from '@/actions/uploads'

export const postProfile = async (
  values: ProfileDataPostInput,
  files: {
    birthCertificate?: FormData
    residencePermit?: FormData
    addressProof?: FormData
    passport?: FormData
    identityPicture?: FormData
  }
): Promise<Profile> => {
  const currentUser = await getCurrentUserOrThrow()
  const uploadedFiles: string[] = []

  try {
    const [profileData, birthCertificateFileData, residencePermitFileData, addressProofFileData, passportFileData, identityPictureFileData] = await Promise.all([
      createProfileData(values, currentUser),
      processFileData(files.birthCertificate),
      processFileData(files.residencePermit),
      processFileData(files.addressProof),
      processFileData(files.passport),
      processFileData(files.identityPicture)
    ]);

    if (identityPictureFileData) {
      profileData.identityPicture = { create: identityPictureFileData }
      uploadedFiles.push(identityPictureFileData.key)
    }

    if (birthCertificateFileData) {
      profileData.birthCertificate = { create: birthCertificateFileData }
      uploadedFiles.push(birthCertificateFileData.key)
    }

    if (residencePermitFileData) {
      profileData.residencePermit = { create: residencePermitFileData }
      uploadedFiles.push(residencePermitFileData.key)
    }

    if (addressProofFileData) {
      profileData.addressProof = { create: addressProofFileData }
      uploadedFiles.push(addressProofFileData.key)
    }

    if (passportFileData) {
      profileData.passport = { create: passportFileData }
      uploadedFiles.push(passportFileData.key)
    }

    const linkedCountry = await db.country.findFirst({
      where: { name: values.contactInfo.address.country },
      select: { id: true, consulate: { select: { id: true } } },
    })

    if (linkedCountry) {
      profileData.consulate = { connect: { id: linkedCountry.consulate.id } }
    }

    await db.user.update({
      where: { id: currentUser.id },
      data: {
        name: `${values.basicInfo.firstName} ${values.basicInfo.lastName}`,
        image: identityPictureFileData?.url ?? undefined,
      },
    })

    return db.profile.create({ data: profileData })
  } catch (error) {
    // Delete uploaded files in case of an error
    await deleteFiles(uploadedFiles)
    throw error
  }
}

export const getProfileFromUser = async (
  id: string
): Promise<FullProfile | null> => {
  const profile = await db.profile.findFirst({
    where: {
      userId: id,
    },
    include: {
      consulate: {
        select: {
          id: true,
          name: true,
          isGeneral: true,
          website: true,
          logo: {
            select: {
              url: true,
            },
          },
          address: true,
          phone: true,
        },
      },
      address: {
        select: {
          id: true,
          firstLine: true,
          secondLine: true,
          country: true,
          city: true,
          zipCode: true,
        },
      },
      addressProof: {
        select: {
          url: true,
          type: true,
        },
      },
      birthCertificate: {
        select: {
          url: true,
          type: true,
        },
      },
      residencePermit: {
        select: {
          url: true,
          type: true,
        },
      },
      passport: {
        select: {
          url: true,
          type: true,
        },
      },
      identityPicture: {
        select: {
          url: true,
          type: true,
        },
      },
      emergencyContact: {
        select: {
          fullName: true,
          relationship: true,
          phone: true,
        },
      }
    },
  })

  if (!profile) {
    return null
  }

  return profile
}

export const getProfile = async (id: string): Promise<FullProfile> => {
  const profile = await db.profile.findUnique({
    where: {
      id,
    },
    include: {
      consulate: {
        select: {
          id: true,
          name: true,
          website: true,
          logo: {
            select: {
              url: true,
            },
          },
          isGeneral: true,
          address: true,
          phone: true,
        },
      },
      address: {
        select: {
          id: true,
          firstLine: true,
          secondLine: true,
          country: true,
          city: true,
          zipCode: true,
        },
      },
      addressProof: {
        select: {
          url: true,
          type: true,
        },
      },
      birthCertificate: {
        select: {
          url: true,
          type: true,
        },
      },
      residencePermit: {
        select: {
          url: true,
          type: true,
        },
      },
      passport: {
        select: {
          url: true,
          type: true,
        },
      },
      identityPicture: {
        select: {
          url: true,
          type: true,
        },
      },
      emergencyContact: {
        select: {
          fullName: true,
          relationship: true,
          phone: true,
        },
      }
    },
  })

  if (!profile) {
    notFound()
  }

  return profile
}

export const deleteProfile = async (id: string) => {
  const currentUser = await getCurrentUserOrThrow()
  const isOwner = await checkIfIsProfileOwner(id, currentUser.id)

  if (!isOwner) {
    throw new Error("Vous n'êtes pas autorisé à supprimer ce profil")
  }

  if (!currentUser) {
    throw new Error('User not found')
  }

  const profile = await db.profile.findFirst({
    where: {
      id,
      userId: currentUser.id,
    },
  })

  if (!profile) {
    throw new Error('Profile not found')
  }

  return db.profile.delete({
    where: {
      id,
      userId: currentUser.id,
    },
  })
}

async function createProfileData(
  values: ProfileDataPostInput,
  currentUser: User
): Promise<Prisma.ProfileCreateInput> {
  const validValues = ProfileDataPostSchema.safeParse(values);

  if (!validValues.success) {
    throw new Error("Erreur lors de la validation des données");
  }

  return {
    user: {
      connect: {
        id: currentUser.id,
      },
    },
    firstName: validValues.data.basicInfo.firstName,
    lastName: validValues.data.basicInfo.lastName,
    gender: validValues.data.basicInfo.gender,
    email: validValues.data.contactInfo.email,
    phone: validValues.data.contactInfo.phone,
    birthPlace: validValues.data.basicInfo.birthPlace,
    birthDate: validValues.data.basicInfo.birthDate,
    birthCountry: validValues.data.basicInfo.birthCountry,
    maritalStatus: validValues.data.familyInfo.maritalStatus,
    workStatus: validValues.data.professionalInfo.workStatus,
    nationality: validValues.data.basicInfo.nationality,
    address: {
      create: validValues.data.contactInfo.address,
    },
    consulate: {},
    residenceCountry: validValues.data.contactInfo.address.country,
    fatherFullName: validValues.data.familyInfo.fatherFullName,
    motherFullName: validValues.data.familyInfo.motherFullName,
    emergencyContact: validValues.data.familyInfo.emergencyContact
      ? {
        create: validValues.data.familyInfo.emergencyContact,
      }
      : undefined,
    spouseFullName: validValues.data.familyInfo.spouseFullName,
    profession: validValues.data.professionalInfo.profession,
    employer: validValues.data.professionalInfo.employer,
    employerAddress: validValues.data.professionalInfo.employerAddress,
    lastActivityGabon: validValues.data.professionalInfo.lastActivityGabon,
    nationalityAcquisition: validValues.data.requestType.nationalityAcquisition,
  };
}

export const checkIfIsProfileOwner = async (
  profileId: string,
  userId: string
) => {
  const profile = await db.profile.findFirst({
    where: {
      id: profileId,
      userId,
    },
  })

  return !!profile
}

/** type PrintOrderData = {
  metadata: {
    [key: string]: string
  }
  shipTo: {
    name: string
    address: {
      addressLine: string[]
      city: string
      postcode: string
      countryCode: string
    }
  }
  shippingLetter: string[] // Assuming this is an array of string IDs
  products: Array<{
    modelId:
      | 'ntag424_pvccard_white'
      | 'ntag424_woodcard'
      | 'mifare1k_pvccard_white'
    metadata: {
      [key: string]: string
    }
    nfc: {
      type: 'empty' | string
    }
    printingVisuals: string[] // Assuming this is an array of string IDs or paths
  }>
}

export const placePrintOrder = async (
  profileData: FullProfile,
  cards: FormData
) => {
  const countryCode = await getCountryCode(profileData.address.country)
  const frontFile = await uploadFileToPrint(cards.get('front') as FormData)

  const apiData: PrintOrderData = {
    metadata: {
      profileId: profileData.id,
      userId: profileData.userId,
    },
    shipTo: {
      name: `${profileData.firstName} ${profileData.lastName}`,
      address: {
        addressLine: [
          profileData.address.firstLine,
          profileData.address.secondLine ?? '',
        ],
        city: profileData.address.city,
        postcode: profileData.address.zipCode,
        countryCode: countryCode ?? profileData.address.country,
      },
    },
    products: [
      {
        modelId: 'ntag424_pvccard_white',
        metadata: {
          profileId: profileData.id,
          userId: profileData.userId,
        },
        nfc: {
          type: `${process.env.NEXT_PUBLIC_URL}/${PAGE_ROUTES.view}/${profileData.id}`,
        },
        printingVisuals: [
          'https://utfs.io/f/710ca127-0479-49b8-bab9-4a507e6cbe26-h9uowm.png',
          'https://utfs.io/f/710ca127-0479-49b8-bab9-4a507e6cbe26-h9uowm.png',
        ],
      },
    ],
  }
}*/

export const updateProfile = async (
  id: string,
  values: ProfileDataPostInput,
  files: {
    birthCertificate?: FormData
    residencePermit?: FormData
    addressProof?: FormData
    passport?: FormData
    identityPicture?: FormData
  }
): Promise<Profile> => {
  const currentUser = await getCurrentUserOrThrow()
  const uploadedFiles: string[] = []

  try {
    const isOwner = await checkIfIsProfileOwner(id, currentUser.id)
    if (!isOwner) {
      throw new Error("You're not authorized to update this profile")
    }

    const [profileData, birthCertificateFileData, residencePermitFileData, addressProofFileData, passportFileData, identityPictureFileData] = await Promise.all([
      createProfileUpdateData(values),
      processFileData(files.birthCertificate),
      processFileData(files.residencePermit),
      processFileData(files.addressProof),
      processFileData(files.passport),
      processFileData(files.identityPicture)
    ]);

    if (identityPictureFileData) {
      profileData.identityPicture = { create: identityPictureFileData }
      uploadedFiles.push(identityPictureFileData.key)
    }

    if (birthCertificateFileData) {
      profileData.birthCertificate = { create: birthCertificateFileData }
      uploadedFiles.push(birthCertificateFileData.key)
    }

    if (residencePermitFileData) {
      profileData.residencePermit = { create: residencePermitFileData }
      uploadedFiles.push(residencePermitFileData.key)
    }

    if (addressProofFileData) {
      profileData.addressProof = { create: addressProofFileData }
      uploadedFiles.push(addressProofFileData.key)
    }

    if (passportFileData) {
      profileData.passport = { create: passportFileData }
      uploadedFiles.push(passportFileData.key)
    }

    const linkedCountry = await db.country.findFirst({
      where: { name: values.contactInfo.address.country },
      select: { id: true, consulate: { select: { id: true } } },
    })

    if (linkedCountry) {
      profileData.consulate = { connect: { id: linkedCountry.consulate.id } }
    }

    return db.profile.update({
      where: { id },
      data: profileData,
    })
  } catch (error) {
    // Delete uploaded files in case of an error
    await deleteFiles(uploadedFiles)
    throw error
  }
}

async function createProfileUpdateData(
  values: ProfileDataPostInput
): Promise<Prisma.ProfileUpdateInput> {
  const validValues = ProfileDataPostSchema.safeParse(values);

  if (!validValues.success) {
    const errors = validValues.error.errors
      // eslint-disable-next-line
      .map((error: any) => error.message)
      .join('\n');

    throw new Error(errors);
  }

  return {
    firstName: validValues.data.basicInfo.firstName,
    lastName: validValues.data.basicInfo.lastName,
    gender: validValues.data.basicInfo.gender,
    email: validValues.data.contactInfo.email,
    phone: validValues.data.contactInfo.phone,
    birthPlace: validValues.data.basicInfo.birthPlace,
    birthDate: validValues.data.basicInfo.birthDate,
    birthCountry: validValues.data.basicInfo.birthCountry,
    maritalStatus: validValues.data.familyInfo.maritalStatus,
    workStatus: validValues.data.professionalInfo.workStatus,
    nationality: validValues.data.basicInfo.nationality,
    address: {
      update: validValues.data.contactInfo.address,
    },
    residenceCountry: validValues.data.contactInfo.address.country,
    fatherFullName: validValues.data.familyInfo.fatherFullName,
    motherFullName: validValues.data.familyInfo.motherFullName,
    emergencyContact: validValues.data.familyInfo.emergencyContact
      ? {
        update: validValues.data.familyInfo.emergencyContact,
      }
      : undefined,
    spouseFullName: validValues.data.familyInfo.spouseFullName,
    profession: validValues.data.professionalInfo.profession,
    employer: validValues.data.professionalInfo.employer,
    employerAddress: validValues.data.professionalInfo.employerAddress,
    lastActivityGabon: validValues.data.professionalInfo.lastActivityGabon,
    nationalityAcquisition: validValues.data.requestType.nationalityAcquisition,
  };
}

export const uploadFileToPrint = async (
  file: FormData
): Promise<{
  id: string
  mimeType: 'image/png' | 'image/jpeg' | 'image/svg+xml'
  size: number
  createdAt: string
}> => {
  const headers = new Headers()

  headers.append('Authorization', `Bearer ${process.env.PRINTAG_API_KEY}`)

  try {
    const fileData = await fetch(
      `${process.env.PRINTAG_API_URL}/accounts/${process.env.PRINTAG_ACCOUNT_ID}/files`,
      {
        headers,
        body: file,
      }
    )

    const fileDataJson = await fileData.json()

    return {
      id: fileDataJson.files.file.id,
      mimeType: fileDataJson.files.file.mimeType,
      size: fileDataJson.files.file.size,
      createdAt: fileDataJson.files.file.createdAt,
    }
  } catch (error) {
    throw new Error('Failed to upload file')
  }
}

export async function hasProfile(userId: string): Promise<boolean> {
  const profile = await db.profile.findFirst({
    where: {
      userId,
    },
  })

  return !!profile
}