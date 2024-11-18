import { Prisma, Gender, MaritalStatus, WorkStatus, Address } from '@prisma/client'

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

export type AnalysisData = {
  firstName?: string
  lastName?: string
  gender?: Gender
  birthDate?: string
  birthPlace?: string
  birthCountry?: string
  nationality?: string
  passportNumber?: string
  passportIssueDate?: Date
  passportExpiryDate?: Date
  passportIssueAuthority?: string
  address?: Address
  maritalStatus?: MaritalStatus
  fatherFullName?: string
  motherFullName?: string
  workStatus?: WorkStatus
  profession?: string
  employer?: string
  employerAddress?: string
}

export enum RequestType {
  REGISTRATION = 'REGISTRATION',
  RENEWAL = 'RENEWAL',
  REPLACEMENT = 'REPLACEMENT',
}