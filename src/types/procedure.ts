import { DocumentType, RequestType } from '@prisma/client'
import { FullProfile } from '@/types/profile'

export interface ProcedureRequirement {
  id: string
  type: 'DOCUMENT' | 'INFORMATION'
  documentType?: DocumentType
  field?: string
  required: boolean
  description: string
}

export interface ConsularProcedure {
  id: RequestType
  title: string
  description: string
  requirements: ProcedureRequirement[]
  estimatedTime: string
  cost?: number
  urgent?: boolean
}

export interface ProcedureProgress {
  request: Request
  progress: number
  nextStep: string
}

export interface ProcedureDetails {
  procedure: ConsularProcedure
  profile: FullProfile | null
  canStart: boolean
}

export interface ProcedureError extends Error {
  code?: string
  details?: unknown
}

export enum ProcedureFieldType {
  TEXT = 'text',
  SELECT = 'select',
  DATE = 'date',
  EMAIL = 'email',
  TEL = 'tel'
}

export interface ProcedureField {
  name: string
  type: ProcedureFieldType
  required: boolean
  options?: string[]
}

export interface ProcedureFormSection {
  section: string
  fields: ProcedureField[]
}

export interface ConsularProcedure {
  id: RequestType
  title: string
  description: string
  requirements: ProcedureRequirement[]
  estimatedTime: string
  cost?: number
  urgent?: boolean
  formSections?: ProcedureFormSection[]
}

export interface ProcedureRequirement {
  id: string
  type: 'DOCUMENT' | 'INFORMATION'
  documentType?: DocumentType
  field?: string
  required: boolean
  description: string
}

export interface ProcedureProgress {
  request: Request
  progress: number
  nextStep: string
}

export interface ProcedureDetails {
  procedure: ConsularProcedure
  profile: FullProfile | null
  canStart: boolean
}

export interface ProcedureError extends Error {
  code?: string
  details?: unknown
}