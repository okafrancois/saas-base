'use server'

import { signOut } from '@/auth'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { redirect } from 'next/navigation'
import { db } from '@/lib/prisma'
import { generateOTP } from '@/lib/otp'
import { sendOTPEmail, sendSMSOTP } from '@/actions/email'

export const logUserOut = async () => {
  await signOut()

  redirect(PAGE_ROUTES.home)
}

export type AuthType = 'EMAIL' | 'PHONE'

export async function sendOTP(identifier: string, type: AuthType) {
  try {
    const generatedOTP = await generateOTP()

    // Delete any existing OTP for this identifier
    await db.verificationToken.deleteMany({
      where: {
        identifier,
        type,
      },
    })

    // Create new token
    await db.verificationToken.create({
      data: {
        identifier,
        token: generatedOTP,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        type,
      },
    })

    // Send OTP via appropriate channel
    if (type === 'EMAIL') {
      await sendOTPEmail(identifier, generatedOTP)
    } else {
      await sendSMSOTP(identifier, generatedOTP)
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { error: 'Failed to send verification code' }
  }
}