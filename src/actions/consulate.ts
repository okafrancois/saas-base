'use server'

import { db } from '@/lib/prisma'
import { getCurrentUserOrThrow } from '@/actions/user'
import { ConsulateInput, ConsulateSchema } from '@/schemas'
import { deleteFiles } from '@/actions/uploads'
import { notFound } from 'next/navigation'
import { Consulate, Prisma, User } from '@prisma/client'
import {
  FullConsulate,
  ListingConsulate,
  ListingCountry,
} from '@/lib/models-types'
import { processFileData } from '@/actions/utils'

export const postConsulate = async (
  values: ConsulateInput,
  logoFormData: FormData | undefined
): Promise<Consulate> => {
  const currentUser = await getCurrentUserOrThrow()

  const consulateData = await createConsulateData(values, currentUser)
  const logoFileData = await processFileData(
    logoFormData,
    undefined,
    undefined,
    { width: 250, height: 250 }
  )

  return db.$transaction(async (transactionClient) => {
    return transactionClient.consulate.create({
      data: {
        ...consulateData,
        logo: logoFileData ? { create: logoFileData } : undefined,
        countries: {
          create: values.countries,
        },
      },
    })
  })
}

export const updateConsulate = async (
  id: string,
  values: ConsulateInput,
  logoFormData: FormData | undefined
): Promise<Consulate> => {
  const currentUser = await getCurrentUserOrThrow()

  const isOwner = await checkIfIsConsulateOwner(id, currentUser.id)

  if (!isOwner) {
    throw new Error(
      'Vous n\'avez pas la permission de modifier cette entreprise.',
    )
  }

  const consulateData = await createConsulateUpdateData(values)
  const logoFileData = await processFileData(
    logoFormData,
    values.logo?.key,
    db,
    { width: 250, height: 250 }
  )

  return db.$transaction(async (transactionClient) => {
    // Supprimer d'abord toutes les relations existantes avec les pays
    await transactionClient.country.deleteMany({
      where: { consulateId: id },
    })

    // Mettre à jour le consulat avec les nouvelles données et les nouveaux pays
    return transactionClient.consulate.update({
      where: {
        id,
        userId: currentUser.id,
      },
      data: {
        ...consulateData,
        logo: logoFileData ? { create: logoFileData } : undefined,
        countries: {
          create: values.countries,
        },
      },
    })
  })
}

export const getConsulates = async (): Promise<ListingConsulate[]> => {
  const currentUser = await getCurrentUserOrThrow()

  return db.consulate.findMany({
    where: {
      userId: currentUser.id,
    },
    select: {
      id: true,
      name: true,
      website: true,
      address: true,
      logo: {
        select: {
          url: true,
          type: true,
        },
      },
    },
  })
}

export const getConsulate = async (id: string): Promise<FullConsulate> => {
  const Consulate = await db.consulate.findFirst({
    where: {
      id,
    },
    include: {
      address: true,
      logo: {
        select: {
          url: true,
          key: true,
        },
      },
      profiles: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          address: true,
        },
      },
      countries: {
        select: {
          id: true,
          name: true,
          consulateId: true,
        },
      },
    },
  })

  if (!Consulate) {
    notFound()
  }

  return Consulate
}

export const deleteConsulate = async (id: string) => {
  const currentUser = await getCurrentUserOrThrow()

  if (!currentUser) {
    throw new Error('User not found')
  }

  const isOwner = await checkIfIsConsulateOwner(id, currentUser.id)

  if (!isOwner) {
    throw new Error(
      'Vous n\'avez pas la permission de supprimer cette entreprise.',
    )
  }

  return db.$transaction(async (transactionClient) => {
    const consulate = await transactionClient.consulate.findFirst({
      where: {
        id,
        userId: currentUser.id,
      },
      include: {
        logo: true,
        countries: true,
        profiles: true,
      },
    })

    if (!consulate) {
      throw new Error('Consulate not found')
    }

    // Supprimer les pays liés
    await transactionClient.country.deleteMany({
      where: { consulateId: id },
    })

    // Mettre à jour les profils liés pour les dissocier du consulat
    await transactionClient.profile.updateMany({
      where: { consulateId: id },
      data: { consulateId: undefined }, // Use null instead of undefined
    })

    // Stocker la clé du logo pour la suppression ultérieure
    const logoKey = consulate.logo?.key

    // Supprimer le consulat
    await transactionClient.consulate.delete({
      where: {
        id,
        userId: currentUser.id,
      },
    })

    // Retourner la clé du logo si elle existe
    return { deletedConsulateId: id, logoKey }
  }).then(async ({ deletedConsulateId, logoKey }) => {
    // Supprimer le fichier logo après la transaction si nécessaire
    if (logoKey) {
      try {
        await deleteFiles([logoKey], db)
      } catch (error) {
        console.error('Error deleting logo file:', error)
        // Considérez de journaliser cette erreur ou de la gérer d'une autre manière appropriée
      }
    }
    return deletedConsulateId
  })
}


/**
 * Create consulates data, validate and return the data. If invalid, throw an error.
 * @param values
 * @param currentUser
 */
async function createConsulateData(
  values: ConsulateInput,
  currentUser: User
): Promise<Prisma.ConsulateCreateInput> {
  const validValues = ConsulateSchema.safeParse(values)

  if (!validValues.success) {
    const errors = validValues.error.errors
      .map((error: any) => error.message)
      .join(', ')

    throw new Error(errors)
  }

  return {
    name: validValues.data.name,
    email: validValues.data.email,
    website: validValues.data.website,
    user: {
      connect: {
        id: currentUser.id,
      },
    },
    phone: validValues.data.phone,
    address: {
      create: validValues.data.address,
    },
    countries: {
      create: validValues.data.countries,
    },
  }
}
async function createConsulateUpdateData(
  values: ConsulateInput,
): Promise<Prisma.ConsulateUpdateInput> {
  const validValues = ConsulateSchema.safeParse(values)

  if (!validValues.success) {
    throw new Error('Invalid fields')
  }

  return {
    name: validValues.data.name,
    email: validValues.data.email,
    website: validValues.data.website,
    phone: validValues.data.phone,
    address: {
      update: validValues.data.address,
    },
    isGeneral: validValues.data.isGeneral,
  }
}

export const checkIfIsConsulateOwner = async (
  consulateId: string,
  userId: string
) => {
  const consulate = await db.consulate.findFirst({
    where: {
      id: consulateId,
      userId,
    },
  })

  return !!consulate
}

export const getCountries = async (): Promise<ListingCountry[]> => {
  return db.country.findMany({
    select: {
      id: true,
      name: true,
      consulateId: true,
    },
  })
}

/**async function manageCountries(
  values: ConsulateInput,
  data: Prisma.ConsulateUpdateInput,
  consulateId: string
) {
  const existingCountries = await db.country.findMany({
    where: {
      name: {
        in: values.countries.map((country) => country.name),
      },
    },
  })

  const consulateDatas = await db.consulate.findUnique({
    where: {
      id: consulateId,
    },
    select: {
      countries: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!consulateDatas) {
    throw new Error('Le consulat n’a pas été trouvé')
  }

  const currentCountries = consulateDatas.countries

  // Disconnect key skills that are not in the new list
  const toDisconnect = currentCountries
    .filter(
      (country) =>
        !values.countries.some((newCountry) => newCountry.name === country.name)
    )
    .map((country) => ({ id: country.id }))

  // Create new key skills that are not in the existing list
  const toCreate = values.countries
    .filter(
      (country) =>
        !existingCountries.some(
          (existingCountry) => existingCountry.name === country.name
        )
    )
    .map((country) => ({ name: country.name }))

  // Connect existing key skills
  const toConnect = existingCountries.map((skill) => ({ id: skill.id }))

  data.countries = {
    disconnect: toDisconnect,
    create: toCreate,
    connect: toConnect,
  }
 }*/