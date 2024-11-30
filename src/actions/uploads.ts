'use server'

import { UTApi } from 'uploadthing/server'

const utapi = new UTApi()

export async function uploadFiles(
  fd: FormData,
) {
  try {
    const files = fd.getAll('files') as File[]

    if (!files || files.length === 0) {
      throw new Error('No files provided')
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