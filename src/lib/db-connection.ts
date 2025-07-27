import { PrismaClient } from '@prisma/client'
import { withConnectionPool, forceDisconnectPool } from './connection-pool'

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
}

// Fonction pour vérifier si une erreur est liée à la connexion
export function isConnectionError(error: unknown): boolean {
  if (!error) return false
  
  const errorMessage = (error as Error).message?.toLowerCase() || ''
  const errorCode = (error as { code?: string }).code?.toLowerCase() || ''
  
  return (
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('network') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('enotfound') ||
    errorMessage.includes('too many connections') ||
    errorMessage.includes('prisma_migration') ||
    errorCode.includes('p1001') || // Prisma connection error
    errorCode.includes('p1008') || // Prisma timeout
    errorCode.includes('p1017')    // Prisma server closed connection
  )
}

// Fonction pour calculer le délai avec backoff exponentiel
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(2, attempt - 1)
  return Math.min(delay, config.maxDelay)
}

// Fonction pour exécuter une opération avec retry
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  operationName = 'database-operation'
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      console.log(`[DB] Starting operation: ${operationName}`)
      const result = await operation()
      
      if (attempt > 1) {
        console.log(`[DB] Operation succeeded after ${attempt} attempts: ${operationName}`)
      }
      
      return result
    } catch (error) {
      lastError = error as Error
      
      console.error(`[DB] Operation failed:`, {
         error: lastError.message,
         code: (lastError as { code?: string }).code,
         retriesLeft: config.maxRetries - attempt,
         timestamp: new Date().toISOString()
       })
      
      // Si c'est une erreur de connexion, forcer la déconnexion du pool
      if (isConnectionError(lastError)) {
        console.log('[DB] Connection error detected, forcing pool disconnect...')
        await forceDisconnectPool().catch(() => {})
      }
      
      // Si ce n'est pas une erreur de connexion ou si c'est la dernière tentative
      if (!isConnectionError(lastError) || attempt === config.maxRetries) {
        throw lastError
      }
      
      // Attendre avant la prochaine tentative
      const delay = calculateDelay(attempt, config)
      console.log(`[DB] Retrying operation in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Fonction pour nettoyer les connexions
export async function cleanupConnections(prisma: PrismaClient): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('[DB] Connections cleaned up successfully')
  } catch (error) {
    console.error('[DB] Error during cleanup:', error)
  }
}

// Fonction pour vérifier la santé de la base de données
export async function healthCheck(prisma: PrismaClient): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('[DB] Health check failed:', error)
    return false
  }
}

// Fonction wrapper pour les opérations critiques
export async function safeDbOperation<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  operationName = 'safe-operation'
): Promise<T> {
  if (process.env.NODE_ENV === 'production') {
    // En production, utiliser le pool de connexions avec retry
    return executeWithRetry(
      () => withConnectionPool(operation),
      DEFAULT_RETRY_CONFIG,
      operationName
    )
  } else {
    // En développement, utiliser executeWithRetry directement
    const { prisma } = await import('./db')
    return executeWithRetry(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => operation(prisma as any),
      DEFAULT_RETRY_CONFIG,
      operationName
    )
  }
}

// Fonction pour gérer les erreurs de base de données de manière centralisée
export function handleDatabaseError(error: unknown, context: string): never {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined
  const errorMeta = error && typeof error === 'object' && 'meta' in error ? error.meta : undefined
  
  console.error(`[DB Error] ${context}:`, {
    message: errorMessage,
    code: errorCode,
    meta: errorMeta,
    timestamp: new Date().toISOString()
  })

  // Mapper les erreurs Prisma vers des erreurs plus conviviales
  if (errorCode === 'P2002') {
    throw new Error('Cette ressource existe déjà')
  }
  
  if (errorCode === 'P2025') {
    throw new Error('Ressource non trouvée')
  }
  
  if (isConnectionError(error)) {
    throw new Error('Problème de connexion à la base de données. Veuillez réessayer.')
  }

  throw new Error('Une erreur inattendue s\'est produite')
}