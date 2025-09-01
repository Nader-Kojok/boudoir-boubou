"use client"

import { useEffect, useCallback, useRef } from 'react'
import { cacheManager } from '@/lib/cache-manager'

/**
 * Hook pour gérer la synchronisation des données et éviter les caches obsolètes
 */
export function useDataSync() {
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncRef = useRef<number>(0)

  /**
   * Force la synchronisation des données avec le serveur
   */
  const forcSync = useCallback((cacheKeys?: string[]) => {
    const now = Date.now()
    
    // Éviter les synchronisations trop fréquentes (minimum 1 seconde)
    if (now - lastSyncRef.current < 1000) {
      return
    }
    
    lastSyncRef.current = now
    
    // Invalider le cache spécifié ou tout le cache
    if (cacheKeys) {
      cacheKeys.forEach(key => cacheManager.delete(key))
    } else {
      cacheManager.invalidate()
    }
    
    // Émettre un événement personnalisé pour notifier les composants
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cache-invalidated', {
        detail: { keys: cacheKeys }
      }))
    }
    
    console.log('[DataSync] Forced data synchronization', { cacheKeys })
  }, [])

  /**
   * Synchronisation automatique après une mutation
   */
  const syncAfterMutation = useCallback((cacheKeys?: string[], delay = 500) => {
    // Annuler la synchronisation précédente si elle existe
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    
    // Programmer une nouvelle synchronisation
    syncTimeoutRef.current = setTimeout(() => {
      forcSync(cacheKeys)
    }, delay)
  }, [forcSync])

  /**
   * Nettoie les caches expirés
   */
  const cleanupExpiredCache = useCallback(() => {
    cacheManager.cleanup()
    console.log('[DataSync] Cleaned up expired cache entries')
  }, [])

  /**
   * Écoute les événements de cache invalidé
   */
  useEffect(() => {
    const handleCacheInvalidated = (event: CustomEvent) => {
      console.log('[DataSync] Cache invalidated event received', event.detail)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Nettoyer le cache quand l'utilisateur revient sur la page
        cleanupExpiredCache()
      }
    }

    const handleBeforeUnload = () => {
      // Nettoyer les timeouts avant de quitter la page
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }

    // Ajouter les écouteurs d'événements
    window.addEventListener('cache-invalidated', handleCacheInvalidated as EventListener)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Nettoyer le cache expiré au montage
    cleanupExpiredCache()

    return () => {
      // Nettoyer les écouteurs et timeouts
      window.removeEventListener('cache-invalidated', handleCacheInvalidated as EventListener)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [cleanupExpiredCache])

  return {
    forcSync,
    syncAfterMutation,
    cleanupExpiredCache
  }
}

/**
 * Hook pour synchroniser automatiquement les données après des mutations
 */
export function useAutoSync(cacheKeys?: string[]) {
  const { syncAfterMutation } = useDataSync()

  /**
   * Fonction à appeler après une mutation réussie
   */
  const triggerSync = useCallback(() => {
    syncAfterMutation(cacheKeys)
  }, [syncAfterMutation, cacheKeys])

  return { triggerSync }
}

/**
 * Hook pour détecter les données obsolètes
 */
export function useStaleDataDetection(cacheKey: string, checkInterval = 30000) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { forcSync } = useDataSync()

  const startDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      // Vérifier si les données sont obsolètes
      const hasValidCache = cacheManager.has(cacheKey)
      
      if (!hasValidCache) {
        console.log(`[StaleDetection] Stale data detected for key: ${cacheKey}`)
        forcSync([cacheKey])
      }
    }, checkInterval)
  }, [cacheKey, checkInterval, forcSync])

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    startDetection()
    
    return () => {
      stopDetection()
    }
  }, [startDetection, stopDetection])

  return {
    startDetection,
    stopDetection
  }
}