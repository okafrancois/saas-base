import { Document } from '@prisma/client'

export type DocumentType =
  | 'PASSPORT'
  | 'ID_CARD'
  | 'BIRTH_CERTIFICATE'
  | 'PROOF_OF_ADDRESS'
  | 'RESIDENCE_PERMIT'

export type DocumentStatus =
  | 'PENDING'
  | 'VALIDATED'
  | 'REJECTED'
  | 'EXPIRED'

export interface DocumentWithMetadata extends Document {
  metadata: {
    documentNumber?: string
    issuingAuthority?: string
    validationNotes?: string[]
  }
}