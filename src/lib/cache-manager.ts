"use client"

// Types pour la gestion du cache
interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
}

interface CacheConfig {
  ttl: number // Time to live en millisecondes
  version: string // Version pour invalider le cache
  key: string
}

// Configuration par défaut
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
const CACHE_VERSION = '1.0.0'

/**
 * Gestionnaire de cache amélioré avec invalidation automatique
 */
export class CacheManager {
  private static instance: CacheManager
  private cacheKeys = new Set<string>()

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * Stocke des données dans le cache avec métadonnées
   */
  set<T>(key: string, data: T, config: Partial<CacheConfig> = {}): void {
    const fullConfig: CacheConfig = {
      ttl: DEFAULT_TTL,
      version: CACHE_VERSION,
      key,
      ...config
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: fullConfig.version
    }

    try {
      localStorage.setItem(key, JSON.stringify(entry))
      this.cacheKeys.add(key)
    } catch (error) {
      console.warn(`[CacheManager] Failed to set cache for key: ${key}`, error)
    }
  }

  /**
   * Récupère des données du cache avec validation
   */
  get<T>(key: string, config: Partial<CacheConfig> = {}): T | null {
    const fullConfig: CacheConfig = {
      ttl: DEFAULT_TTL,
      version: CACHE_VERSION,
      key,
      ...config
    }

    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const entry: CacheEntry<T> = JSON.parse(cached)
      
      // Vérifier la version
      if (entry.version !== fullConfig.version) {
        this.delete(key)
        return null
      }

      // Vérifier l'expiration
      const isExpired = Date.now() - entry.timestamp > fullConfig.ttl
      if (isExpired) {
        this.delete(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn(`[CacheManager] Failed to get cache for key: ${key}`, error)
      this.delete(key)
      return null
    }
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): void {
    try {
      localStorage.removeItem(key)
      this.cacheKeys.delete(key)
    } catch (error) {
      console.warn(`[CacheManager] Failed to delete cache for key: ${key}`, error)
    }
  }

  /**
   * Invalide tout le cache ou par pattern
   */
  invalidate(pattern?: string): void {
    if (!pattern) {
      // Invalider tout le cache
      this.cacheKeys.forEach(key => this.delete(key))
      return
    }

    // Invalider par pattern
    const keysToDelete = Array.from(this.cacheKeys).filter(key => 
      key.includes(pattern)
    )
    keysToDelete.forEach(key => this.delete(key))
  }

  /**
   * Vérifie si une entrée existe et est valide
   */
  has(key: string, config: Partial<CacheConfig> = {}): boolean {
    return this.get(key, config) !== null
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const keysToCheck = Array.from(this.cacheKeys)
    keysToCheck.forEach(key => {
      // Tenter de récupérer l'entrée, ce qui la supprimera si elle est expirée
      this.get(key)
    })
  }

  /**
   * Obtient des statistiques sur le cache
   */
  getStats(): { totalKeys: number; keys: string[] } {
    return {
      totalKeys: this.cacheKeys.size,
      keys: Array.from(this.cacheKeys)
    }
  }
}

// Instance globale
export const cacheManager = CacheManager.getInstance()

// Note: Server cache invalidation is handled in api-cache-middleware.ts

/**
 * Utilitaire pour forcer le rechargement des données
 */
export function forceDataRefresh(cacheKeys?: string[]): void {
  // Invalider le cache local
  if (cacheKeys) {
    cacheKeys.forEach(key => cacheManager.delete(key))
  } else {
    cacheManager.invalidate()
  }

  // Forcer le rechargement de la page si nécessaire
  if (typeof window !== 'undefined') {
    // Émettre un événement personnalisé pour notifier les composants
    window.dispatchEvent(new CustomEvent('cache-invalidated', {
      detail: { keys: cacheKeys }
    }))
  }
}

/**
 * Configuration des clés de cache pour différents types de données
 */
export const CACHE_KEYS = {
  ANALYTICS: {
    OVERVIEW: (period: string) => `analytics-overview-${period}`,
    USERS: (period: string) => `analytics-users-${period}`,
    ARTICLES: (period: string) => `analytics-articles-${period}`,
    REVENUE: (period: string) => `analytics-revenue-${period}`,
  },
  USER: {
    PROFILE: (userId: string) => `user-profile-${userId}`,
    ARTICLES: (userId: string) => `user-articles-${userId}`,
  },
  ARTICLES: {
    LIST: (filters: string) => `articles-list-${filters}`,
    DETAIL: (articleId: string) => `article-detail-${articleId}`,
  },
  FEED: {
    SOCIAL: (page: number) => `social-feed-${page}`,
  }
} as const

/**
 * Configuration TTL pour différents types de données
 */
export const CACHE_TTL = {
  ANALYTICS: 5 * 60 * 1000, // 5 minutes
  USER_DATA: 10 * 60 * 1000, // 10 minutes
  ARTICLES: 3 * 60 * 1000, // 3 minutes
  FEED: 2 * 60 * 1000, // 2 minutes
} as const