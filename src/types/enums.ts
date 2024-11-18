export enum AdminActionType {
  APPROVE = 'approve',
  REJECT = 'reject',
  REQUEST_MORE_INFO = 'request_more_info',
  MARK_INCOMPLETE = 'mark_incomplete'
}

export enum DocumentCategory {
  IDENTITY_PICTURE = 'identityPicture',
  PASSPORT = 'passport',
  BIRTH_CERTIFICATE = 'birthCertificate',
  RESIDENCE_PERMIT = 'residencePermit',
  ADDRESS_PROOF = 'addressProof'
}

export enum ConsularEventType {
  REQUEST_CREATED = 'request_created',
  STATUS_UPDATED = 'status_updated',
  DOCUMENT_UPLOADED = 'document_uploaded',
  MESSAGE_SENT = 'message_sent'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}