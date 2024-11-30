import { Document } from '@prisma/client'

export type DocumentWithMetadata = Document & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any
}