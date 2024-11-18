import { ConsularEventType } from './enums'

export interface NotificationData {
  title: string
  content: string
  userId: string
}

export interface MessageData {
  content: string
  userId: string
  requestId: string
}

export interface NoteData {
  content: string
  requestId: string
}

export interface ConsularEvent {
  type: ConsularEventType
  userId: string
  requestId?: string
  data: unknown
  timestamp: Date
}