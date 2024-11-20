// src/types/document.ts

import { Document, DocumentType, DocumentStatus, DocumentValidityPeriod, User } from '@prisma/client'

export interface DocumentWithRelations extends Document {
  user: User
  request?: Request
}

export interface DocumentCreateInput {
  type: DocumentType
  file: File
  requestId?: string
  validityPeriod?: DocumentValidityPeriod
  isOriginal?: boolean
}

export interface DocumentUpdateInput {
  status?: DocumentStatus
  notes?: string
  rejectionReason?: string
  validUntil?: Date
  isVerified?: boolean
}

export interface DocumentAnalysisResult {
  confidenceScore: number
  extractedData: Record<string, any>
  validationResults: {
    isValid: boolean
    issues?: string[]
    warnings?: string[]
  }
}

export interface DocumentValidationRules {
  allowedTypes: string[]
  maxSize: number
  requiredFields: string[]
  validityPeriod: DocumentValidityPeriod
  aiAnalysisRequired: boolean
}

export type DocumentStats = {
  total: number
  byStatus: Record<DocumentStatus, number>
  byType: Record<DocumentType, number>
  expiringWithin30Days: number
  needsRenewal: number
}