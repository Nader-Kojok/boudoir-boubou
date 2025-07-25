import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
// EmailProvider removed - using phone-based authentication
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { loginSchema } from './validations/auth'
import type { UserRole } from '@prisma/client'
import type { JWT } from 'next-auth/jwt'
import type { Session, User, Account, Profile, NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null
        }

        try {
          // Valider les données d'entrée
          const validatedData = loginSchema.parse({
            phone: credentials.phone,
            password: credentials.password,
          })

          // Trouver l'utilisateur
          const user = await prisma.user.findUnique({
            where: { phone: validatedData.phone },
          })

          if (!user || !user.password) {
            return null
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(
            validatedData.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            phone: user.phone,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // EmailProvider removed - using phone-based authentication
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Reduce cookie size to prevent header too large errors
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour - shorter for callback URLs
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
      },
    },
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        // Only store essential data to minimize token size
        token.role = user.role
        // Remove any large data that might be in the token
        delete token.picture
        delete token.image
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        // Fetch fresh user data from database instead of storing in token
        if (token.sub) {
          try {
            const user = await prisma.user.findUnique({
              where: { id: token.sub },
              select: { name: true, image: true, phone: true }
            })
            if (user) {
              session.user.name = user.name
              session.user.image = user.image
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
          }
        }
      }
      return session
    },
    async signIn({ account }: { user: User; account: Account | null; profile?: Profile }) {
      if (account?.provider === 'google') {
        // Google sign-in is disabled for phone-based authentication
        // Users must register with phone number
        return false
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
}