import { Prisma, Gender, MaritalStatus, WorkStatus } from '@prisma/client'

export type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: {
    user: true
    address: true
  }
}>

export interface AddressInput {
  firstLine: string
  secondLine?: string
  city: string
  zipCode?: string
  country: string
}

export interface ProfileInput {
  firstName: string
  lastName: string
  gender: Gender
  birthDate: string
  birthPlace: string
  birthCountry: string
  nationality: string
  maritalStatus?: MaritalStatus
  workStatus?: WorkStatus
  phone?: string
  fatherFullName?: string
  motherFullName?: string
  spouseFullName?: string
  profession?: string
  employer?: string
  employerAddress?: string
  address?: AddressInput
}