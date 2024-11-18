import { Prisma, DocumentType, RequestStatus, NationalityAcquisition } from '@prisma/client'
import { DocumentCategory, AdminActionType } from './enums'

export type RequestWithRelations = Prisma.RequestGetPayload<{
  include: {
    user: true
    consulate: true
    messages: true
    notes: true
  }
}>

export interface ConsularRequestInput {
  type: DocumentType
  nationalityAcquisition: NationalityAcquisition
  documents: Partial<Record<DocumentCategory, string>>
}

export interface RequestFilters {
  status?: RequestStatus
  type?: DocumentType
  dateRange?: {
    start: Date
    end: Date
  }
  consulateId?: string
}

export interface AdminAction {
  action: AdminActionType
  requestId: string
  note?: string
  requiredDocuments?: DocumentCategory[]
}

export interface StatusUpdate {
  status: RequestStatus
  requestId: string
  note?: string
}