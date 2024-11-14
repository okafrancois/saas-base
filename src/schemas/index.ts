import * as z from 'zod'
import { Gender, MaritalStatus, WorkStatus } from '@prisma/client'
import {
  ACCEPTED_FILE_TYPES,
  checkFileSize,
  checkFileType,
  MAX_UPLOAD_SIZE,
  phoneRegex,
} from '@/lib/utils'

export const UserSettingsSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email({
      message: 'Invalid email address',
    }),
  name: z.string({
    required_error: 'Name is required',
  }),
  image: z
    .string({
      required_error: 'Image is required',
    })
    .url({
      message: 'Invalid URL',
    }),
})

export type UserSettingsInput = z.infer<typeof UserSettingsSchema>

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'identifier_required'),
  type: z.enum(['EMAIL', 'PHONE']),
  otp: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'EMAIL') {
    if (!z.string().email().safeParse(data.identifier).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'invalid_email',
        path: ['identifier'],
      })
    }
  } else if (data.type === 'PHONE') {
    const phoneRegex = /^\+\d{10,15}$/
    if (!phoneRegex.test(data.identifier)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'invalid_phone',
        path: ['identifier'],
      })
    }
  }
})

export type LoginInput = z.infer<typeof LoginSchema>

const CustomFile = typeof window === 'undefined' ? Array<File> : FileList

export const ConsulateSchema = z.object({
  logoFile: z
    .instanceof(CustomFile)
    .optional()
    .refine((files) => {
      return checkFileSize(files, MAX_UPLOAD_SIZE)
    }, 'File size must be less than 3MB')
    .refine((files) => {
      return checkFileType(files, ACCEPTED_FILE_TYPES)
    }, 'File must be a PNG, JPEG or JPG'),
  logo: z
    .object({
      key: z.string().optional(),
      url: z.string().url().optional(),
    })
    .optional(),
  name: z.string({
    required_error: 'Le nom est obligatoire',
  }),
  email: z
    .string({
      required_error: "L'email est obligatoire",
    })
    .email(),
  address: z.object({
    firstLine: z.string(),
    secondLine: z.string().nullish(),
    city: z.string(),
    country: z.string(),
    zipCode: z.string(),
  }),
  phone: z
    .string()
    .regex(phoneRegex, 'Numéro de téléphone non valide, format international'),
  website: z.string().url().optional(),
  countries: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
    }),
  )
    .nonempty(),
  isGeneral: z.boolean().default(false),
})

export type ConsulateInput = z.infer<typeof ConsulateSchema>

const FileType = typeof window === 'undefined' ? Array<File> : FileList

export const ProfileSchema = z.object({
  firstName: z.string({
    required_error: 'Le prénom est obligatoire',
  }),
  lastName: z.string({
    required_error: 'Le nom est obligatoire',
  }),
  birthDate: z.string({
    required_error: 'La date de naissance est obligatoire',
  }),
  birthPlace: z.string({
    required_error: 'Le lieu de naissance est obligatoire',
  }),
  birthCountry: z.string({
    required_error: 'Le pays de naissance est obligatoire',
  }),
  gender: z.nativeEnum(Gender, {
    required_error: 'Le genre est obligatoire',
  }),
  email: z
    .string()
    .email().optional(),
  address: z.object({
    firstLine: z.string(),
    secondLine: z.string().nullish(),
    city: z.string(),
    country: z.string(),
    zipCode: z.string(),
  }),
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
  workStatus: z.nativeEnum(WorkStatus).optional(),
  phone: z
    .string()
    .optional(),
  birthCertificate: z
    .object({
      key: z.string().optional(),
      url: z.string().url().optional(),
    })
    .optional(),
  passport: z
    .object({
      key: z.string().optional(),
      url: z.string().url().optional(),
    })
    .optional(),
  identityPicture: z
    .object({
      key: z.string().optional(),
      url: z.string().url().optional(),
    })
    .optional(),
  identityPictureFile: z
    .instanceof(FileType, {
      message: 'Veuillez fournir votre passeport',
    })
    .optional()
    .refine((files) => {
      return checkFileSize(files, MAX_UPLOAD_SIZE)
    }, 'Fichier trop volumineux, taille maximale 3MB')
    .refine((files) => {
      return checkFileType(files, ACCEPTED_FILE_TYPES)
    }, "'Fichier doit être une image au format PNG, JPEG, JPG ou un PDF"),
  passportFile: z
    .instanceof(FileType, {
      message: 'Veuillez fournir votre passeport',
    })
    .optional()
    .refine((files) => {
      return checkFileSize(files, MAX_UPLOAD_SIZE)
    }, 'Fichier trop volumineux, taille maximale 3MB')
    .refine((files) => {
      return checkFileType(files, ACCEPTED_FILE_TYPES)
    }, "'Fichier doit être une image au format PNG, JPEG, JPG ou un PDF"),
  birthCertificateFile: z
    .instanceof(FileType, {
      message: 'Veuillez fournir votre acte de naissance',
    })
    .optional()
    .refine((files) => {
      return checkFileSize(files, MAX_UPLOAD_SIZE)
    }, 'Fichier trop volumineux, taille maximale 3MB')
    .refine((files) => {
      return checkFileType(files, ACCEPTED_FILE_TYPES)
    }, "'Fichier doit être une image au format PNG, JPEG, JPG ou un PDF"),
  addressProof: z
    .object({
      key: z.string().optional(),
      url: z.string().url().optional(),
    })
    .optional(),
  addressProofFile: z
    .instanceof(FileType, {
      message: 'Veuillez fournir un justificatif de domicile',
    })
    .optional()
    .refine((files) => {
      return checkFileSize(files, MAX_UPLOAD_SIZE)
    }, 'Fichier trop volumineux, taille maximale 3MB')
    .refine((files) => {
      return checkFileType(files, ACCEPTED_FILE_TYPES)
    }, "'Fichier doit être une image au format PNG, JPEG, JPG ou un PDF"),
  residencePermit: z
    .object({
      key: z.string().optional(),
      url: z.string().url().optional(),
    })
    .optional(),
  residencePermitFile: z
    .instanceof(FileType, {
      message: 'Veuillez fournir votre titre de séjour',
    })
    .optional()
    .refine((files) => {
      return checkFileSize(files, MAX_UPLOAD_SIZE)
    }, 'Fichier trop volumineux, taille maximale 3MB')
    .refine((files) => {
      return checkFileType(files, ACCEPTED_FILE_TYPES)
    }, 'Fichier doit être une image au format PNG, JPEG, JPG ou un PDF'),
})

export type ProfileInput = z.infer<typeof ProfileSchema>

export const ContactFormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  companyName: z.string().optional(),
  email: z.string().email(),
  phoneNumber: z
    .string()
    .regex(phoneRegex, 'Invalid phone number, use international format'),
  message: z.string().max(100).optional(),
})

export type ContactFormInput = z.infer<typeof ContactFormSchema>

export const DeleteUserSchema = z.object({
  id: z.string(),
})

export type DeleteUserInput = z.infer<typeof DeleteUserSchema>