import {
  Prisma,
  Gender,
  AddressGabon,
  MaritalStatus,
  WorkStatus,
  Address,
  User,
  Profile,
  DocumentStatus,
  NationalityAcquisition,
} from '@prisma/client'

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
  employerAddress?: string,
  acquisitionMode?: NationalityAcquisition
}

export interface UserProfileData extends User{
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

export interface ProfileWithDocuments extends Profile {
  documents: Document[]
  address: Address | null
}

export interface ProfileDocument {
  id: string
  type: DocumentType
  status: DocumentStatus
  fileUrl: string
  issuedAt: Date
  expiresAt?: Date
  metadata: DocumentMetadata
}

export interface DocumentMetadata {
  documentNumber?: string
  issuingAuthority?: string
  validationNotes?: string[]
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

interface FullProfileOthers {
  address: Address
  documents?: Document[]
  passport?: Document
  birthCertificate?: Document
  residencePermit?: Document
  addressProof?: Document
  addressInGabon?: AddressGabon
}

export type FullProfile = Profile & FullProfileOthers