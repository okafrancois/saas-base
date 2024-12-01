import { AppointmentStatus, AppointmentType, RequestStatus } from '@prisma/client'

export interface DashboardStats {
  profile: {
    completionRate: number
    lastUpdate: Date
    missingDocuments: string[]
  }
  requests: {
    pending: number
    inProgress: number
    completed: number
    latest?: {
      id: string
      type: string
      status: string
      updatedAt: Date
    }
  }
  appointments: {
    upcoming?: {
      id: string
      date: Date
      type: string
    }
    total: number
  }
  documents: {
    total: number
    expiringSoon: number
    expired: number
  }
}

export interface DashboardAction {
  id: string
  label: string
  description: string
  href: string
  icon: React.ComponentType<any>
  priority: 'high' | 'medium' | 'low'
}

export interface DashboardSection {
  id: keyof typeof DashboardSectionType
  title: string
  description: string
  stats: DashboardSectionStats
  actions: DashboardAction[]
}

export enum DashboardSectionType {
  PROFILE = 'profile',
  REQUESTS = 'requests',
  PROCEDURES = 'procedures',
  APPOINTMENTS = 'appointments',
  DOCUMENTS = 'documents'
}

export interface DashboardSectionStats {
  profile?: {
    completionRate: number
    lastUpdate: Date
    missingFields: string[]
    status: RequestStatus
  }
  requests?: {
    total: number
    pending: number
    inProgress: number
    completed: number
    latestRequest?: {
      id: string
      type: string
      status: string
      updatedAt: Date
    }
  }
  procedures?: {
    active: number
    completed: number
    nextStep?: {
      id: string
      description: string
      deadline?: Date
    }
  }
  appointments?: {
    upcoming?: {
      id: string
      date: Date
      type: AppointmentType
      status: AppointmentStatus
    }
    past: number
    cancelled: number
  }
  documents?: {
    total: number
    valid: number
    expiringSoon: number
    expired: number
    latestDocument?: {
      id: string
      type: string
      expiryDate: Date
    }
  }
}