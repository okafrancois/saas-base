import * as z from 'zod'
import { Gender, MaritalStatus, NationalityAcquisition, WorkStatus } from '@prisma/client'
import { RequestType } from '@/types'

const FileListSchema = z.any().refine(
  (files) => {
    if (typeof window === 'undefined') return true
    return !files || files instanceof FileList
  },
  'doc_invalid',
)

const DocumentFileSchemaOptional = FileListSchema
  .refine(
    (files) => {
      if (typeof window === 'undefined') return true
      if (!files || files.length === 0) return true
      const file = files[0]
      return file.size <= 10 * 1024 * 1024 // 10MB
    },
    { message: 'doc_size_10', path: [] }
  )
  .refine(
    (files) => {
      if (typeof window === 'undefined') return true
      if (!files || files.length === 0) return true
      const file = files[0]
      const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      return acceptedTypes.includes(file.type)
    },
    { message: 'doc_type_image_pdf', path: [] }
  )

const DocumentFileSchema = FileListSchema
  .refine(
    (files) => {
      if (typeof window === 'undefined') return true
      return files && files.length > 0
    },
    { message: 'doc_required', path: [] }
  )
  .refine(
    (files) => {
      if (typeof window === 'undefined') return true
      if (!files || files.length === 0) return true
      const file = files[0]
      return file.size <= 10 * 1024 * 1024 // 10MB
    },
    { message: 'doc_size_10', path: [] }
  )
  .refine(
    (files) => {
      if (typeof window === 'undefined') return true
      if (!files || files.length === 0) return true
      const file = files[0]
      const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      return acceptedTypes.includes(file.type)
    },
    { message: 'doc_type_image_pdf', path: [] }
  )

// Request Type Schema - Première étape
export const RequestTypeSchema = z.object({
  documentType: z.nativeEnum(RequestType),
  nationalityAcquisition: z.nativeEnum(NationalityAcquisition),
})

const PASSPORT_MIN_VALIDITY_MONTHS = 6;
const PASSPORT_MAX_VALIDITY_YEARS = 10;

// Helper functions pour la validation des dates
const addMonths = (date: Date, months: number) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const addYears = (date: Date, years: number) => {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
};

export const BasicInfoSchema = z.object({
  gender: z.nativeEnum(Gender, {
    required_error: 'errors.validation.gender_required'
  }),

  firstName: z.string({
    required_error: 'errors.validation.first_name_required'
  }).min(2, 'errors.validation.first_name_too_short'),

  lastName: z.string({
    required_error: 'errors.validation.last_name_required'
  }).min(2, 'errors.validation.last_name_too_short'),

  birthDate: z.string({
    required_error: 'errors.validation.birth_date_required'
  }),

  birthPlace: z.string({
    required_error: 'errors.validation.birth_place_required'
  }),

  birthCountry: z.string({
    required_error: 'errors.validation.birth_country_required'
  }),

  nationality: z.string({
    required_error: 'errors.validation.nationality_required'
  }),

  identityPictureFile: DocumentFileSchema,

  passportNumber: z
    .string({
      required_error: 'errors.validation.passport.number_required',
    })
    .min(8, 'errors.validation.passport.number_too_short')
    .max(9, 'errors.validation.passport.number_too_long')
    .regex(
      /^[A-Z0-9]{8,9}$/,
      'errors.validation.passport.number_invalid_format'
    ),

  passportIssueDate: z
    .date({
      required_error: 'errors.validation.passport.issue_date_required',
      invalid_type_error: 'errors.validation.passport.issue_date_invalid',
    })
    .refine(
      (date) => date <= new Date(),
      'errors.validation.passport.issue_date_future'
    )
    .refine(
      (date) => date >= addYears(new Date(), -10),
      'errors.validation.passport.issue_date_too_old'
    ),

  passportExpiryDate: z
    .date({
      required_error: 'errors.validation.passport.expiry_date_required',
      invalid_type_error: 'errors.validation.passport.expiry_date_invalid',
    })
    .refine(
      (date) => date > new Date(),
      'errors.validation.passport.already_expired'
    )
    .refine(
      (date) => date > addMonths(new Date(), PASSPORT_MIN_VALIDITY_MONTHS),
      'errors.validation.passport.expires_soon'
    ),

  passportIssueAuthority: z
    .string({
      required_error: 'errors.validation.passport.authority_required',
    })
    .min(2, 'errors.validation.passport.authority_too_short')
    .max(100, 'errors.validation.passport.authority_too_long'),
})
  // Validation croisée des dates
  .refine(
    (data) => {
      if (data.passportIssueDate && data.passportExpiryDate) {
        // Vérifier que la date d'expiration est après la date d'émission
        if (data.passportExpiryDate <= data.passportIssueDate) {
          return false;
        }

        // Vérifier que la durée de validité ne dépasse pas 10 ans
        const validityYears = (data.passportExpiryDate.getTime() - data.passportIssueDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return validityYears <= PASSPORT_MAX_VALIDITY_YEARS;
      }
      return true;
    },
    {
      message: 'errors.validation.passport.invalid_validity_period',
      path: ['passportExpiryDate'], // Le message s'affichera sous ce champ
    }
  );

export const BasicInfoPostSchema = z.object({
  gender: z.nativeEnum(Gender, {
    required_error: 'Le genre est requis',
  }),
  firstName: z.string({
    required_error: 'Le prénom est requis',
  }).min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string({
    required_error: 'Le nom est requis',
  }).min(2, 'Le nom doit contenir au moins 2 caractères'),
  birthDate: z.string({
    required_error: 'La date de naissance est requise',
  }),
  birthPlace: z.string({
    required_error: 'Le lieu de naissance est requis',
  }),
  birthCountry: z.string({
    required_error: 'Le pays de naissance est requis',
  }),
  nationality: z.string({
    required_error: 'La nationalité est requise',
  }),

  passportNumber: z.string().optional(),
  passportIssueDate: z.date().optional(),
  passportExpiryDate: z.date().optional(),
  passportIssueAuthority: z.string().optional(),
})

export const ContactInfoSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  phone: z.string().min(1, 'Le numéro de téléphone est requis').optional(),
  address: z.object({
    firstLine: z.string().min(1, 'L\'adresse est requise'),
    secondLine: z.string().optional(),
    city: z.string().min(1, 'La ville est requise'),
    zipCode: z.string().min(1, 'Le code postal est requis'),
    country: z.string().min(1, 'Le pays est requis'),
  }),
  addressGabon: z.object({
    address: z.string().min(1, 'L\'adresse au Gabon est requise'),
    district: z.string().min(1, 'Le quartier est requis'),
    city: z.string().min(1, 'La ville est requise'),
  }).optional(),
})

export const FamilyInfoSchema = z.object({
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
  fatherFullName: z.string().min(1, 'Le nom complet du père est requis'),
  motherFullName: z.string().min(1, 'Le nom complet de la mère est requis'),
  emergencyContact: z.object({
    fullName: z.string().min(1, 'Le nom complet est requis'),
    relationship: z.string().min(1, 'Le lien de parenté est requis'),
    phone: z.string().min(1, 'Le numéro de téléphone est requis'),
  }).optional(),
  spouseFullName: z.string().min(1, 'Le nom complet du/de la conjoint(e) est requis').optional(),
})

export const ProfessionalInfoSchema = z.object({
  workStatus: z.nativeEnum(WorkStatus).optional(),
  profession: z.string().optional(),
  employer: z.string().optional(),
  employerAddress: z.string().optional(),
  lastActivityGabon: z.string().optional(),
})

export const DocumentsSchema = z.object({
  passportFile: DocumentFileSchema,
  birthCertificateFile: DocumentFileSchema,
  residencePermitFile: DocumentFileSchemaOptional,
  addressProofFile: DocumentFileSchema,
})

export const ProfileDataSchema = z.object({
  requestType: RequestTypeSchema,
  contactInfo: ContactInfoSchema,
  familyInfo: FamilyInfoSchema,
  basicInfo: BasicInfoSchema,
  professionalInfo: ProfessionalInfoSchema,
  documents: DocumentsSchema,
});

export const ProfileDataPostSchema = z.object({
  requestType: RequestTypeSchema,
  contactInfo: ContactInfoSchema,
  familyInfo: FamilyInfoSchema,
  basicInfo: BasicInfoPostSchema,
  professionalInfo: ProfessionalInfoSchema,
});

export type ProfileDataPostInput = z.infer<typeof ProfileDataPostSchema>;
export type ProfileDataInput = z.infer<typeof ProfileDataSchema>;
export type RequestTypeFormData = z.infer<typeof RequestTypeSchema>
export type BasicInfoFormData = z.infer<typeof BasicInfoSchema>
export type ContactInfoFormData = z.infer<typeof ContactInfoSchema>
export type FamilyInfoFormData = z.infer<typeof FamilyInfoSchema>
export type ProfessionalInfoFormData = z.infer<typeof ProfessionalInfoSchema>
export type DocumentsFormData = z.infer<typeof DocumentsSchema>