'use server'

import { PrismaClient } from '@prisma/client'
import { UTApi } from 'uploadthing/server'
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from '@/lib/utils'

const utapi = new UTApi()

export async function uploadFiles(
  fd: FormData,
) {
  try {
    const files = fd.getAll('files') as File[]

    if (!files || files.length === 0) {
      throw new Error('No files provided')
    }

    // Validate file size
    for (const file of files) {
      if (file.size > MAX_UPLOAD_SIZE) {
        throw new Error(`File ${file.name} exceeds maximum size of ${MAX_UPLOAD_SIZE / (1024 * 1024)}MB`)
      }
    }

    // Validate file types
    for (const file of files) {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        throw new Error(`File type ${file.type} not accepted. Allowed types: ${ACCEPTED_FILE_TYPES.join(', ')}`)
      }
    }

    return await utapi.uploadFiles(files)

  } catch (error) {
    console.error('Upload error:', error)
    throw error instanceof Error
      ? error
      : new Error('Failed to upload files')
  }
}

export async function deleteFiles(
  keys: string[],
) {
  const promises = []
  for (const key of keys) {
    promises.push(utapi.deleteFiles(key))
  }

  try {
    return Promise.all(promises)
  } catch (error) {
    throw new Error('Error deleting files')
  }
}