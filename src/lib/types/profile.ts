import { Profile, Document, Address, DocumentType } from '@prisma/client'
import { DocumentStatus } from 'deepl-node'

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