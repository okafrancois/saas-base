import { db } from '@/lib/prisma'
import type { NoteData } from '@/types'

export async function createNote(data: NoteData) {
  return db.note.create({
    data: {
      content: data.content,
      request: { connect: { id: data.requestId } }
    }
  })
}

export async function getRequestNotes(requestId: string) {
  return db.note.findMany({
    where: { requestId },
    orderBy: {
      createdAt: 'desc'
    }
  })
}