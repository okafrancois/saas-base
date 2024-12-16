import { prisma } from '@/lib/prisma'
import { customAlphabet } from 'nanoid'

export const generateOTP = async () => {
  const nanoid = customAlphabet('0123456789', 6)
  return nanoid()
}

export const validateOTP = async ({
                                    identifier,
                                    otp,
                                    type,
                                  }: {
  identifier: string
  otp: string
  type: 'EMAIL' | 'PHONE'
}) => {
  try {
    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: otp,
        type,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!token) return false

    // Supprimer le token après utilisation
    await prisma.verificationToken.delete({
      where: { id: token.id }
    })

    return true
  } catch (error) {
    console.error('OTP Validation Error:', error)
    return false
  }
}