import { Document } from '@prisma/client'

export interface DocumentWithMetadata extends Document {
  metadata: {
    documentNumber?: string
    issuingAuthority?: string
    validationNotes?: string[]
  }
}

export interface DocumentWithMetadata extends Document {
  metadata: {
    documentNumber?: string
    issuingAuthority?: string
    validationNotes?: string[]
  }
}