import { DocumentType, RequestType } from '@prisma/client'
import { ConsularProcedure, ProcedureFieldType } from '@/types/procedure'

export const CONSULAR_REGISTRATION: ConsularProcedure = {
  id: RequestType.CONSULAR_REGISTRATION,
  title: 'types.CONSULAR_REGISTRATION.title',
  description: 'types.CONSULAR_REGISTRATION.description',
  estimatedTime: '30-45',
  requirements: [
    {
      id: 'passport',
      type: 'DOCUMENT',
      documentType: DocumentType.PASSPORT,
      required: true,
      description: 'types.CONSULAR_REGISTRATION.requirements.passport.title'
    },
    {
      id: 'identity_photo',
      type: 'DOCUMENT',
      documentType: DocumentType.IDENTITY_PHOTO,
      required: true,
      description: 'types.CONSULAR_REGISTRATION.requirements.identity_photo.title'
    },
    {
      id: 'birth_certificate',
      type: 'DOCUMENT',
      documentType: DocumentType.BIRTH_CERTIFICATE,
      required: true,
      description: 'types.CONSULAR_REGISTRATION.requirements.birth_certificate.title'
    },
    {
      id: 'proof_of_address',
      type: 'DOCUMENT',
      documentType: DocumentType.PROOF_OF_ADDRESS,
      required: true,
      description: 'types.CONSULAR_REGISTRATION.requirements.proof_of_address.title'
    },
    {
      id: 'residence_permit',
      type: 'DOCUMENT',
      documentType: DocumentType.RESIDENCE_PERMIT,
      required: true,
      description: 'types.CONSULAR_REGISTRATION.requirements.residence_permit.title'
    }
  ],
  formSections: [
    {
      section: 'personal_info',
      fields: [
        { name: 'lastName', type: ProcedureFieldType.TEXT, required: true },
        { name: 'firstName', type: ProcedureFieldType.TEXT, required: true },
        { name: 'birthDate', type: ProcedureFieldType.DATE, required: true },
        { name: 'birthPlace', type: ProcedureFieldType.TEXT, required: true },
        { name: 'nationality', type: ProcedureFieldType.TEXT, required: true },
        { name: 'otherNationalities', type: ProcedureFieldType.TEXT, required: false },
        { name: 'arrivalDate', type: ProcedureFieldType.DATE, required: true }
      ]
    },
    {
      section: 'family_info',
      fields: [
        { name: 'fatherFullName', type: ProcedureFieldType.TEXT, required: true },
        { name: 'motherFullName', type: ProcedureFieldType.TEXT, required: true },
        {
          name: 'maritalStatus',
          type: ProcedureFieldType.SELECT,
          required: true,
          options: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']
        }
      ]
    },
    {
      section: 'contact_info',
      fields: [
        { name: 'address', type: ProcedureFieldType.TEXT, required: true },
        { name: 'phone', type: ProcedureFieldType.TEL, required: true },
        { name: 'mobile', type: ProcedureFieldType.TEL, required: true },
        { name: 'email', type: ProcedureFieldType.EMAIL, required: true },
        { name: 'gabonAddress', type: ProcedureFieldType.TEXT, required: true }
      ]
    },
    {
      section: 'professional_info',
      fields: [
        { name: 'lastGabonActivity', type: ProcedureFieldType.TEXT, required: true },
        { name: 'currentProfession', type: ProcedureFieldType.TEXT, required: true },
        { name: 'employerName', type: ProcedureFieldType.TEXT, required: false },
        { name: 'employerAddress', type: ProcedureFieldType.TEXT, required: false },
        { name: 'employerPhone', type: ProcedureFieldType.TEL, required: false }
      ]
    },
    {
      section: 'emergency_contact',
      fields: [
        { name: 'emergencyContactName', type: ProcedureFieldType.TEXT, required: true },
        { name: 'emergencyContactPhone', type: ProcedureFieldType.TEL, required: true },
        { name: 'emergencyContactRelation', type: ProcedureFieldType.TEXT, required: true }
      ]
    }
  ]
}

export const AVAILABLE_PROCEDURES = [
  CONSULAR_REGISTRATION,
  // ... autres procédures
]