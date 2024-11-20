import { Appointment, AppointmentType, AppointmentStatus } from '@prisma/client'

export type { AppointmentType, AppointmentStatus }

export interface AppointmentWithDetails extends Appointment {
  user: {
    name: string | null
    email: string | null
    phone: string | null
  }
  consulate: {
    name: string
    address: {
      firstLine: string
      city: string
      country: string
    } | null
  }
}