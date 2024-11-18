import { db } from '@/lib/prisma'
import type { MessageData } from '@/types'

export async function createMessage(data: MessageData) {
  return db.message.create({
    data: {
      content: data.content,
      user: { connect: { id: data.userId } },
      request: { connect: { id: data.requestId } }
    },
    include: {
      user: true
    }
  })
}

export async function getRequestMessages(requestId: string) {
  return db.message.findMany({
    where: { requestId },
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
}