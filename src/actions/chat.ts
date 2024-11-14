'use server'

import { chatWithGPT } from '@/lib/ai-chat'
import { getUserLocale } from '@/services/locale'
import { createUserContext } from '@/lib/user-context'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'

export async function chatWithRay(message: string): Promise<string> {
  const defaultLanguage = await getUserLocale()
  const session = await auth()

  let userContext = null
  if (session?.user) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: {
          include: {
            consulate: {
              include: {
                countries: true,
              },
            },
          },
        },
      },
    })

    if (user) {
      userContext = createUserContext(user, user.profile, user.profile?.consulate || null)
    }
  }

  try {
    return await chatWithGPT(message, defaultLanguage, userContext)
  } catch (error) {
    console.error('Error in chat action:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get response from Ray: ${error.message}`)
    } else {
      throw new Error('An unknown error occurred')
    }
  }
}