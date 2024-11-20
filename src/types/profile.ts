import { Prisma, Gender, MaritalStatus, WorkStatus, Address, User, Profile } from '@prisma/client'
import { BasicInfoSchema, ContactInfoSchema, FamilyInfoSchema, ProfessionalInfoSchema } from '@/schemas/registration'
import { z } from 'zod'

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

export type ConsularFormData = {
  basicInfo: z.infer<typeof BasicInfoSchema>
  contactInfo: z.infer<typeof ContactInfoSchema>
  familyInfo: z.infer<typeof FamilyInfoSchema>
  professionalInfo: z.infer<typeof ProfessionalInfoSchema>
}


export interface UserProfileData {
  user: User & {
    profile: Profile & {
      address: Address
    }
  }
}

export interface ProfileStats {
  documentsCount: number
  requestsCount: number
  lastLogin?: Date
  profileCompletion: number
}

export interface ProfileAction {
  id: string
  label: string
  description: string
  status: 'pending' | 'completed' | 'expired'
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
}

export interface ProfileStats {
  documentsCount: number
  documentsValidated: number
  documentsPending: number
  documentsExpired: number
  requestsCount: number
  lastLogin?: Date
  profileCompletion: number
}