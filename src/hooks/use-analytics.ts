'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

// Interface for analytics data structure
// Currently unused but kept for future implementation
// interface AnalyticsData {
//   overview: {
//     totalUsers: number
//     totalArticles: number
//     totalSales: number
//     totalRevenue: number
//     chartData: {
//       newUsers: Array<{ date: string; count: number }>
//       newArticles: Array<{ date: string; count: number }>
//       sales: Array<{ date: string; amount: number }>
//     }
//   }
//   users: {
//     totalCount: number
//     distributionByRole: Array<{ role: string; count: number; percentage: number }>
//     topSellers: Array<{ id: string; name: string; email: string; articlesCount: number; salesCount: number; totalRevenue: number }>
//   }
//   articles: {
//     totalCount: number
//     distributionByCategory: Array<{ category: string; count: number; percentage: number }>
//     distributionByCondition: Array<{ condition: string; count: number; percentage: number }>
//     topViewed: Array<{ id: string; title: string; views: number; category: string }>
//   }
//   revenue: {
//     totalRevenue: number
//     revenueOverTime: Array<{ date: string; amount: number }>
//     distributionByPaymentMethod: Array<{ method: string; amount: number; percentage: number }>
//     byCategory: Array<{ category: string; amount: number; percentage: number }>
//   }
//   activities: Array<{
//     id: string
//     type: string
//     description: string
//     createdAt: string
//     user?: { name: string; email: string }
//   }>
// }

interface AnalyticsState {
  overview: unknown
  users: unknown
  articles: unknown
  revenue: unknown
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface UseAnalyticsOptions {
  period?: string
  autoRefresh?: boolean
  refreshInterval?: number
  enableCache?: boolean
}

const CACHE_KEY = 'analytics-cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    period = '7d',
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    enableCache = true
  } = options

  // Removed unused data state
  const [state, setState] = useState<AnalyticsState>({
    overview: null,
    users: null,
    articles: null,
    revenue: null,
    loading: true,
    error: null,
    lastUpdated: null
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fonction pour charger depuis le cache
  const loadFromCache = useCallback(() => {
    if (!enableCache) return null
    
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}-${period}`)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const isExpired = Date.now() - timestamp > CACHE_DURATION
        
        if (!isExpired) {
          return data
        }
      }
    } catch (error) {
      console.warn('Failed to load from cache:', error)
    }
    
    return null
  }, [period, enableCache])

  // Fonction pour sauvegarder en cache
  const saveToCache = useCallback((data: unknown) => {
    if (!enableCache) return
    
    try {
      localStorage.setItem(`${CACHE_KEY}-${period}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Failed to save to cache:', error)
    }
  }, [period, enableCache])

  // Fonction principale pour récupérer les analytics
  const fetchAnalytics = useCallback(async (useCache = true) => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Vérifier le cache d'abord
    if (useCache) {
      const cachedData = loadFromCache()
      if (cachedData) {
        setState(prev => ({
          ...prev,
          ...cachedData,
          loading: false,
          error: null,
          lastUpdated: new Date()
        }))
        return
      }
    }

    // Créer un nouveau AbortController
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Récupération parallèle optimisée
      // Fetching analytics data
      const [overviewRes, usersRes, articlesRes, revenueRes, activitiesRes] = await Promise.all([
        fetch(`/api/admin/analytics/overview?period=${period}`, { signal }),
        fetch(`/api/admin/analytics/users?period=${period}`, { signal }),
        fetch(`/api/admin/analytics/articles?period=${period}`, { signal }),
        fetch(`/api/admin/analytics/revenue?period=${period}`, { signal }),
        fetch(`/api/admin/analytics/activities?period=${period}`, { signal })
      ])

      const [overview, users, articles, revenue] = await Promise.all([
        overviewRes.json(),
        usersRes.json(),
        articlesRes.json(),
        revenueRes.json(),
        activitiesRes.json()
      ])
      
      const newData = {
        overview,
        users,
        articles,
        revenue
      }

      // Sauvegarder en cache
      saveToCache(newData)

      setState(prev => ({
        ...prev,
        ...newData,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }))

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Requête annulée, ne pas traiter comme une erreur
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des analytics'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      
      toast.error(errorMessage)
    }
  }, [period, loadFromCache, saveToCache])

  // Fonction pour forcer le rechargement
  const refresh = useCallback(() => {
    fetchAnalytics(false)
  }, [fetchAnalytics])

  // Fonction pour vider le cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(`${CACHE_KEY}-${period}`)
      toast.success('Cache vidé')
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }, [period])

  // Effet pour le chargement initial
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Effet pour l'auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchAnalytics(false)
      }, refreshInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [autoRefresh, refreshInterval, fetchAnalytics])

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    ...state,
    refresh,
    clearCache,
    isStale: state.lastUpdated ? Date.now() - state.lastUpdated.getTime() > CACHE_DURATION : false
  }
}

// Hook spécialisé pour les métriques en temps réel
export function useRealTimeMetrics(period = '1d') {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    newArticles: 0,
    pendingPayments: 0,
    loading: true
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/admin/analytics/realtime?period=${period}`)
        if (response.ok) {
          const data = await response.json()
          setMetrics({ ...data, loading: false })
        }
      } catch (error) {
        console.error('Failed to fetch real-time metrics:', error)
        setMetrics(prev => ({ ...prev, loading: false }))
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [period])

  return metrics
}