import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

/**
 * Middleware pour gérer le cache des API routes
 */
export class ApiCacheMiddleware {
  private static instance: ApiCacheMiddleware
  private cacheHeaders = new Map<string, string>()

  private constructor() {}

  static getInstance(): ApiCacheMiddleware {
    if (!ApiCacheMiddleware.instance) {
      ApiCacheMiddleware.instance = new ApiCacheMiddleware()
    }
    return ApiCacheMiddleware.instance
  }

  /**
   * Ajoute des headers de cache à une réponse
   */
  addCacheHeaders(response: NextResponse, options: {
    maxAge?: number
    staleWhileRevalidate?: number
    tags?: string[]
    noCache?: boolean
  } = {}): NextResponse {
    const {
      maxAge = 300, // 5 minutes par défaut
      staleWhileRevalidate = 60, // 1 minute
      tags = [],
      noCache = false
    } = options

    if (noCache) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    } else {
      const cacheControl = `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
      response.headers.set('Cache-Control', cacheControl)
      
      if (tags.length > 0) {
        response.headers.set('Cache-Tags', tags.join(','))
      }
    }

    // Ajouter un timestamp pour le debugging
    response.headers.set('X-Cache-Timestamp', new Date().toISOString())
    
    return response
  }

  /**
   * Invalide le cache pour des tags spécifiques
   */
  async invalidateCache(tags: string | string[]): Promise<void> {
    const tagArray = Array.isArray(tags) ? tags : [tags]
    
    try {
      for (const tag of tagArray) {
        revalidateTag(tag)
      }
      console.log('[ApiCache] Cache invalidated for tags:', tagArray)
    } catch (error) {
      console.error('[ApiCache] Failed to invalidate cache:', error)
    }
  }

  /**
   * Crée une réponse avec cache pour les données
   */
  createCachedResponse(data: unknown, options: {
    status?: number
    maxAge?: number
    tags?: string[]
    noCache?: boolean
  } = {}): NextResponse {
    const { status = 200, ...cacheOptions } = options
    
    const response = NextResponse.json(data, { status })
    return this.addCacheHeaders(response, cacheOptions)
  }

  /**
   * Middleware pour les mutations qui invalident le cache
   */
  async handleMutation(request: NextRequest, handler: () => Promise<NextResponse>, options: {
    invalidateTags?: string[]
    revalidatePaths?: string[]
  } = {}): Promise<NextResponse> {
    try {
      const response = await handler()
      
      // Si la mutation a réussi, invalider le cache
      if (response.ok && options.invalidateTags) {
        await this.invalidateCache(options.invalidateTags)
      }
      
      // Ajouter des headers pour empêcher la mise en cache des mutations
      return this.addCacheHeaders(response, { noCache: true })
    } catch (error) {
      console.error('[ApiCache] Mutation failed:', error)
      throw error
    }
  }

  /**
   * Vérifie si une requête doit être mise en cache
   */
  shouldCache(request: NextRequest): boolean {
    const method = request.method
    const url = new URL(request.url)
    
    // Ne pas mettre en cache les mutations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return false
    }
    
    // Ne pas mettre en cache les requêtes avec des paramètres de cache
    if (url.searchParams.has('no-cache') || url.searchParams.has('refresh')) {
      return false
    }
    
    return true
  }

  /**
   * Génère une clé de cache basée sur la requête
   */
  generateCacheKey(request: NextRequest): string {
    const url = new URL(request.url)
    const pathname = url.pathname
    const searchParams = url.searchParams.toString()
    
    return `${pathname}${searchParams ? `?${searchParams}` : ''}`
  }
}

// Instance globale
export const apiCache = ApiCacheMiddleware.getInstance()

/**
 * Helper pour créer des réponses avec cache
 */
export function createCachedApiResponse(data: unknown, options: {
  maxAge?: number
  tags?: string[]
  noCache?: boolean
} = {}) {
  return apiCache.createCachedResponse(data, options)
}

/**
 * Helper pour invalider le cache après une mutation
 */
export async function invalidateApiCache(tags: string | string[]) {
  return apiCache.invalidateCache(tags)
}

/**
 * Decorator pour les handlers d'API avec cache automatique
 */
export function withCache(options: {
  maxAge?: number
  tags?: string[]
  noCache?: boolean
} = {}) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      try {
        const response = await handler(request)
        
        if (apiCache.shouldCache(request)) {
          return apiCache.addCacheHeaders(response, options)
        }
        
        return response
      } catch (error) {
        console.error('[ApiCache] Handler error:', error)
        throw error
      }
    }
  }
}

/**
 * Decorator pour les handlers de mutation avec invalidation automatique
 */
export function withMutation(options: {
  invalidateTags?: string[]
  revalidatePaths?: string[]
} = {}) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      return apiCache.handleMutation(request, () => handler(request), options)
    }
  }
}

/**
 * Configuration des tags de cache pour différents types de données
 */
export const CACHE_TAGS = {
  ANALYTICS: 'analytics',
  USERS: 'users',
  ARTICLES: 'articles',
  FEED: 'feed',
  PROFILE: 'profile',
  CATEGORIES: 'categories',
  REPORTS: 'reports'
} as const

/**
 * Configuration des durées de cache
 */
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  VERY_LONG: 3600 // 1 heure
} as const