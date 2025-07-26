import { PrismaClient } from '@prisma/client'

// Gestionnaire de pool de connexions pour la production
class ConnectionPool {
  private static instance: ConnectionPool
  private client: PrismaClient | null = null
  private isConnecting = false
  private connectionPromise: Promise<PrismaClient> | null = null

  private constructor() {}

  static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool()
    }
    return ConnectionPool.instance
  }

  private createClient(): PrismaClient {
    const databaseUrl = process.env.DATABASE_URL
    const connectionUrl = databaseUrl?.includes('?') 
      ? `${databaseUrl}&connection_limit=1&pool_timeout=3&connect_timeout=5&pgbouncer=true`
      : `${databaseUrl}?connection_limit=1&pool_timeout=3&connect_timeout=5&pgbouncer=true`

    return new PrismaClient({
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    })
  }

  async getConnection(): Promise<PrismaClient> {
    // En développement, utiliser l'instance globale
    if (process.env.NODE_ENV !== 'production') {
      if (!this.client) {
        this.client = this.createClient()
      }
      return this.client
    }

    // En production, gérer une seule connexion à la fois
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    if (this.client) {
      return this.client
    }

    if (this.isConnecting) {
      // Attendre que la connexion en cours se termine
      await new Promise(resolve => setTimeout(resolve, 100))
      return this.getConnection()
    }

    this.isConnecting = true
    this.connectionPromise = this.createConnectionWithTimeout()
    
    try {
      this.client = await this.connectionPromise
      return this.client
    } finally {
      this.isConnecting = false
      this.connectionPromise = null
    }
  }

  private async createConnectionWithTimeout(): Promise<PrismaClient> {
    const client = this.createClient()
    
    // Test de connexion avec timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    })

    try {
      await Promise.race([
        client.$queryRaw`SELECT 1`,
        timeoutPromise
      ])
      return client
    } catch (error) {
      await client.$disconnect().catch(() => {})
      throw error
    }
  }

  async executeOperation<T>(operation: (client: PrismaClient) => Promise<T>): Promise<T> {
    let client: PrismaClient | null = null
    
    try {
      client = await this.getConnection()
      const result = await operation(client)
      
      // En production, déconnecter immédiatement après l'opération
      if (process.env.NODE_ENV === 'production') {
        await this.disconnect()
      }
      
      return result
    } catch (error) {
      // En cas d'erreur, forcer la déconnexion
      if (process.env.NODE_ENV === 'production') {
        await this.disconnect()
      }
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.$disconnect()
      } catch (error) {
        console.error('[ConnectionPool] Error disconnecting:', error)
      } finally {
        this.client = null
      }
    }
  }

  async forceDisconnect(): Promise<void> {
    this.connectionPromise = null
    this.isConnecting = false
    await this.disconnect()
  }
}

// Instance singleton
const connectionPool = ConnectionPool.getInstance()

// Fonction utilitaire pour exécuter des opérations avec gestion de pool
export async function withConnectionPool<T>(
  operation: (client: PrismaClient) => Promise<T>
): Promise<T> {
  return connectionPool.executeOperation(operation)
}

// Fonction pour forcer la déconnexion (utile pour les tests)
export async function forceDisconnectPool(): Promise<void> {
  return connectionPool.forceDisconnect()
}

// Gestionnaire de nettoyage pour les signaux de processus
if (process.env.NODE_ENV === 'production') {
  const cleanup = async () => {
    console.log('[ConnectionPool] Cleaning up connections...')
    await connectionPool.forceDisconnect()
  }

  process.on('beforeExit', cleanup)
  process.on('SIGINT', async () => {
    await cleanup()
    process.exit(0)
  })
  process.on('SIGTERM', async () => {
    await cleanup()
    process.exit(0)
  })
}

export default connectionPool