import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
// EmailProvider removed - using phone-based authentication
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { safeDbOperation } from './db-connection'
import { loginSchema } from './validations/auth'
import type { UserRole } from '@prisma/client'
import type { JWT } from 'next-auth/jwt'
import type { Session, User, Account, NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('[NextAuth Error]', code, metadata)
    },
    warn(code) {
      console.warn('[NextAuth Warning]', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[NextAuth Debug]', code, metadata)
      }
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[NextAuth Authorize] Tentative d\'authentification:', {
          phone: credentials?.phone,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV
        })

        if (!credentials?.phone || !credentials?.password) {
          console.log('[NextAuth Authorize] Credentials manquantes')
          return null
        }

        try {
          // Valider les données d'entrée
          const validatedData = loginSchema.parse({
            phone: credentials.phone,
            password: credentials.password,
          })

          console.log('[NextAuth Authorize] Données validées, recherche utilisateur:', validatedData.phone)

          // Trouver l'utilisateur avec gestion sécurisée des connexions
          const user = await safeDbOperation(
            () => prisma.user.findUnique({
              where: { phone: validatedData.phone },
            }),
            'authorize-findUser'
          )

          console.log('[NextAuth Authorize] Résultat recherche utilisateur:', {
            userFound: !!user,
            userId: user?.id,
            hasPassword: !!user?.password,
            userRole: user?.role
          })

          if (!user || !user.password) {
            console.log('[NextAuth Authorize] Utilisateur non trouvé ou pas de mot de passe')
            return null
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(
            validatedData.password,
            user.password
          )

          console.log('[NextAuth Authorize] Vérification mot de passe:', {
            isValid: isPasswordValid,
            userId: user.id
          })

          if (!isPasswordValid) {
            console.log('[NextAuth Authorize] Mot de passe invalide pour:', user.id)
            return null
          }

          console.log('[NextAuth Authorize] Authentification réussie pour:', {
            userId: user.id,
            phone: user.phone,
            role: user.role
          })

          return {
            id: user.id,
            phone: user.phone,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error('[NextAuth Authorize] Erreur d\'authentification:', error)
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
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Don't set domain for Vercel deployments to avoid cookie issues
        domain: undefined,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: undefined,
        maxAge: 60 * 60, // 1 hour
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
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
        console.log('[NextAuth JWT] Creating token for user:', user.id)
        // Store essential user data in token to reduce DB queries
        token.role = user.role
        token.name = user.name
        // Remove any large data that might be in the token
        delete token.picture
        delete token.image
      }
      
      console.log('[NextAuth JWT] Token created/updated:', {
        sub: token.sub,
        role: token.role,
        tokenSize: JSON.stringify(token).length
      })
      
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log('[NextAuth Session] Creating session for token:', token.sub)
      
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        // Optimisation : éviter les requêtes DB fréquentes pour les sessions
        // Les données utilisateur essentielles sont stockées dans le token JWT
        // Seules les données critiques sont récupérées si nécessaire
        if (token.sub && !session.user.name) {
          try {
            const user = await safeDbOperation(
              () => prisma.user.findUnique({
                where: { id: token.sub },
                select: { name: true, image: true, phone: true }
              }),
              'session-getUserData'
            )
            if (user) {
              session.user.name = user.name
              session.user.image = user.image
              console.log('[NextAuth Session] User data fetched successfully')
            } else {
              console.warn('[NextAuth Session] User not found in database:', token.sub)
            }
          } catch (error) {
            console.error('[NextAuth Session] Error fetching user data:', error)
            // En cas d'erreur DB, utiliser les données du token si disponibles
            session.user.name = token.name || 'Utilisateur'
          }
        }
      }
      
      console.log('[NextAuth Session] Session created:', {
        userId: session.user?.id,
        userRole: session.user?.role,
        environment: process.env.NODE_ENV
      })
      
      return session
    },
    async signIn({ user, account }: { user: User; account: Account | null }) {
      console.log('[NextAuth SignIn]', {
         provider: account?.provider,
         userId: user?.id,
         userEmail: user?.email,
         environment: process.env.NODE_ENV,
         url: process.env.NEXTAUTH_URL
       })
      
      if (account?.provider === 'google') {
        console.log('[NextAuth] Google sign-in attempt blocked - phone-based auth only')
        // Google sign-in is disabled for phone-based authentication
        // Users must register with phone number
        return false
      }
      
      console.log('[NextAuth] Sign-in successful for user:', user?.id)
      return true
    },
    async redirect({ url, baseUrl }) {
      // Handle production environment with proper domain
      const productionUrl = process.env.NEXTAUTH_URL || baseUrl
      
      console.log('[NextAuth Redirect]', {
        requestedUrl: url,
        baseUrl,
        productionUrl,
        environment: process.env.NODE_ENV,
        vercelUrl: process.env.VERCEL_URL
      })
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        const redirectUrl = `${productionUrl}${url}`
        console.log('[NextAuth] Redirecting to relative URL:', redirectUrl)
        return redirectUrl
      }
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === new URL(productionUrl).origin) {
        console.log('[NextAuth] Redirecting to same origin:', url)
        return url
      }
      
      // Default redirect to dashboard instead of baseUrl
      const defaultRedirect = `${productionUrl}/dashboard`
      console.log('[NextAuth] Default redirect to dashboard:', defaultRedirect)
      return defaultRedirect
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
}