import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import type { UserRole } from '@prisma/client'

/**
 * Récupère la session côté serveur
 * Utilisable dans les Server Components, API Routes, et getServerSideProps
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export async function hasRole(role: UserRole) {
  const session = await getSession()
  return session?.user?.role === role
}

/**
 * Vérifie si l'utilisateur a l'un des rôles spécifiés
 */
export async function hasAnyRole(roles: UserRole[]) {
  const session = await getSession()
  return session?.user?.role ? roles.includes(session.user.role) : false
}

/**
 * Récupère l'utilisateur actuel ou null
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}