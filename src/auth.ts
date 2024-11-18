import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/prisma'
import { User } from '@prisma/client'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { getUserById } from '@/lib/user/getters'
import authConfig from '@/auth.config'

declare module 'next-auth' {
  interface Session {
    user: User
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signOut,
  signIn,
} = NextAuth({
  adapter: PrismaAdapter(db),
  pages: {
    signIn: PAGE_ROUTES.login,
    error: PAGE_ROUTES.auth_error,
  },
  events: {
    async linkAccount({ user }) {
      if (!user.id) {
        throw new Error('User not found')
      }

      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        const existingUser = await getUserById(token.sub)

        if (existingUser) {
          session.user.role = existingUser.role
          session.user.phone = existingUser.phone
        }

        session.user.id = token.sub
      }

      return session
    },
    async jwt({ token }) {
      return token
    }
  },
  session: { strategy: 'jwt' },
  ...authConfig,
})