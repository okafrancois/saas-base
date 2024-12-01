import { JsonObject } from '@prisma/client/runtime/library'
import { SortDirection } from './enums'
import { JsonArray } from 'type-fest'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  limit: number
  orderBy?: string
  orderDirection?: SortDirection
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Types utilitaires
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
export type RequireOnly<T, K extends keyof T> = Partial<T> & Pick<T, K>

export declare type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray