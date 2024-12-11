import * as z from 'zod'
import { Gender, MaritalStatus, NationalityAcquisition, WorkStatus } from '@prisma/client'

const FileListSchema = z.any().refine(
  (files) => {
    // Si on est côté serveur, on skip la validation
    if (typeof window === 'undefined') return true
    // Si pas de fichier, on retourne false pour déclencher la validation required
    if (!files) return false
    // Si c'est une FileList, c'est valide
    if (files instanceof FileList) return true
    // Si c'est déjà un File, c'est valide
    if (files instanceof File) return true
    // Sinon invalide
    return false
  },
  'messages.errors.doc_invalid',
)

const DocumentFileSchema = z.union([
  // Soit null/undefined
  z.null(),
  // Soit un fichier valide
  FileListSchema
    .refine(
      (files) => {
        if (typeof window === 'undefined') return true
        if (!files) return false
        const file = files instanceof FileList ? files[0] : files
        if (!file) return false
        return file.size <= 10 * 1024 * 1024 // 10MB
      },
      { message: 'messages.errors.doc_size_10' }
    )
    .refine(
      (files) => {
        if (typeof window === 'undefined') return true
        if (!files) return false
        const file = files instanceof FileList ? files[0] : files
        if (!file) return false
        const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf']
        return acceptedTypes.includes(file.type)
      },
      { message: 'messages.errors.doc_type_image_pdf' }
    )
])
  .refine(
    (files) => {
      // Cette validation vérifie si le fichier est requis
      if (typeof window === 'undefined') return true
      return files !== null && files !== undefined
    },
    { message: 'messages.errors.doc_required' }
  )

const DocumentFileSchemaOptional = z.union([
  z.null(),
  FileListSchema
    .refine(
      (files) => {
        if (typeof window === 'undefined') return true
        if (!files) return true // Optionnel donc null/undefined est valide
        const file = files instanceof FileList ? files[0] : files
        if (!file) return true
        return file.size <= 10 * 1024 * 1024
      },
      { message: 'messages.errors.doc_size_10' }
    )
    .refine(
      (files) => {
        if (typeof window === 'undefined') return true
        if (!files) return true
        const file = files instanceof FileList ? files[0] : files
        if (!file) return true
        const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf']
        return acceptedTypes.includes(file.type)
      },
      { message: 'messages.errors.doc_type_image_pdf' }
    )
])

// Constantes de validation
export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
  EMAIL_MAX_LENGTH: 255,
  ADDRESS_MAX_LENGTH: 100,
} as const

export const DocumentsSchema = z.object({
  passportFile: DocumentFileSchema,
  birthCertificateFile: DocumentFileSchema,
  residencePermitFile: DocumentFileSchemaOptional,
  addressProofFile: DocumentFileSchema,
})

export type DocumentsFormData = z.infer<typeof DocumentsSchema>