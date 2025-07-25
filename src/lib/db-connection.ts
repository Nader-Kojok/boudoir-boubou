import { prisma } from './db'

// Configuration pour la gestion des connexions
const CONNECTION_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 seconde
  connectionTimeout: 10000, // 10 secondes
}

// Fonction pour exécuter une requête avec retry et gestion d'erreurs
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  retries = CONNECTION_CONFIG.maxRetries
): Promise<T> {
  try {
    return await operation()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined
    console.error(`[DB] Operation failed:`, {
      error: errorMessage,
      code: errorCode,
      retriesLeft: retries,
      timestamp: new Date().toISOString()
    })

    // Si c'est une erreur de connexion et qu'il reste des tentatives
    if (retries > 0 && isConnectionError(error)) {
      console.log(`[DB] Retrying operation in ${CONNECTION_CONFIG.retryDelay}ms...`)
      await new Promise(resolve => setTimeout(resolve, CONNECTION_CONFIG.retryDelay))
      return executeWithRetry(operation, retries - 1)
    }

    throw error
  }
}

// Vérifier si l'erreur est liée à la connexion
function isConnectionError(error: unknown): boolean {
  const connectionErrors = [
    'too many connections',
    'connection timeout',
    'connection refused',
    'connection reset',
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'P1001', // Prisma connection error
    'P1008', // Operations timed out
    'P1017', // Server has closed the connection
  ]

  const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase()
  const errorCode = (error && typeof error === 'object' && 'code' in error ? String(error.code) : '').toLowerCase()

  return connectionErrors.some(errorType => 
    errorMessage.includes(errorType) || errorCode.includes(errorType)
  )
}

// Fonction pour nettoyer les connexions inactives
export async function cleanupConnections() {
  try {
    await prisma.$disconnect()
    console.log('[DB] Connections cleaned up successfully')
  } catch (error) {
    console.error('[DB] Error cleaning up connections:', error)
  }
}

// Fonction pour vérifier la santé de la base de données avec timeout
export async function healthCheck(): Promise<boolean> {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as health`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), CONNECTION_CONFIG.connectionTimeout)
      )
    ])
    
    console.log('[DB] Health check passed')
    return true
  } catch (error) {
    console.error('[DB] Health check failed:', error)
    return false
  }
}

// Wrapper pour les opérations de base de données critiques
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now()
  
  try {
    console.log(`[DB] Starting operation: ${operationName}`)
    
    const result = await executeWithRetry(operation)
    
    const duration = Date.now() - startTime
    console.log(`[DB] Operation completed: ${operationName} (${duration}ms)`)
    
    return result
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined
    const errorStack = error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : undefined
    
    console.error(`[DB] Operation failed: ${operationName} (${duration}ms)`, {
      error: errorMessage,
      code: errorCode,
      stack: errorStack
    })
    
    throw error
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