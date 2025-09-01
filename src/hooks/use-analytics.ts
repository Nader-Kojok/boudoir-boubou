'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { cacheManager, CACHE_KEYS, CACHE_TTL, forceDataRefresh } from '@/lib/cache-manager'

interface AnalyticsOverview {
  totalUsers: number
  totalArticles: number
  totalRevenue: number
  activeUsers: number
  pendingArticles: number
  recentActivities: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    user?: {
      name: string
      image?: string
    }
  }>
}

interface AnalyticsUsers {
  totalUsers: number
  newUsers: number
  activeUsers: number
  userGrowth: number
  usersByRole: Array<{
    role: string
    count: number
    percentage: number
  }>
  recentUsers: Array<{
    id: string
    name: string
    email?: string
    phone: string
    role: string
    createdAt: string
    image?: string
  }>
  userActivity: Array<{
    date: string
    newUsers: number
    activeUsers: number
  }>
}

interface AnalyticsArticles {
  totalArticles: number
  activeArticles: number
  soldArticles: number
  pendingArticles: number
  articleGrowth: number
  averagePrice: number
  topCategories: Array<{
    category: string
    count: number
    percentage: number
  }>
  recentArticles: Array<{
    id: string
    title: string
    price: number
    status: string
    createdAt: string
    category: string
    seller: string
  }>
  recentlySold: Array<{
    id: string
    title: string
    price: number
    soldAt: string
    category: string
    seller: string
  }>
}

interface AnalyticsRevenue {
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  averageOrderValue: number
  totalTransactions: number
  revenueByCategory: Array<{
    category: string
    revenue: number
    percentage: number
  }>
  monthlyTrend: Array<{
    month: string
    revenue: number
    transactions: number
  }>
  recentTransactions: Array<{
    id: string
    amount: number
    method: string
    completedAt: string
    buyer: {
      name: string
      image?: string
    }
    seller: {
      name: string
      image?: string
    }
    article: {
      title: string
      category: string
    }
  }>
}

interface AnalyticsState {
  overview: AnalyticsOverview | null
  users: AnalyticsUsers | null
  articles: AnalyticsArticles | null
  revenue: AnalyticsRevenue | null
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
      const overviewKey = CACHE_KEYS.ANALYTICS.OVERVIEW(period)
      const usersKey = CACHE_KEYS.ANALYTICS.USERS(period)
      const articlesKey = CACHE_KEYS.ANALYTICS.ARTICLES(period)
      const revenueKey = CACHE_KEYS.ANALYTICS.REVENUE(period)
      
      const overview = cacheManager.get(overviewKey, { ttl: CACHE_TTL.ANALYTICS })
      const users = cacheManager.get(usersKey, { ttl: CACHE_TTL.ANALYTICS })
      const articles = cacheManager.get(articlesKey, { ttl: CACHE_TTL.ANALYTICS })
      const revenue = cacheManager.get(revenueKey, { ttl: CACHE_TTL.ANALYTICS })
      
      if (overview && users && articles && revenue) {
        return { overview, users, articles, revenue }
      }
    } catch (error) {
      console.warn('Failed to load from cache:', error)
    }
    
    return null
  }, [period, enableCache])

  // Fonction pour sauvegarder en cache
  const saveToCache = useCallback((data: { overview: unknown, users: unknown, articles: unknown, revenue: unknown }) => {
    if (!enableCache) return
    
    try {
      const overviewKey = CACHE_KEYS.ANALYTICS.OVERVIEW(period)
      const usersKey = CACHE_KEYS.ANALYTICS.USERS(period)
      const articlesKey = CACHE_KEYS.ANALYTICS.ARTICLES(period)
      const revenueKey = CACHE_KEYS.ANALYTICS.REVENUE(period)
      
      cacheManager.set(overviewKey, data.overview, { ttl: CACHE_TTL.ANALYTICS })
      cacheManager.set(usersKey, data.users, { ttl: CACHE_TTL.ANALYTICS })
      cacheManager.set(articlesKey, data.articles, { ttl: CACHE_TTL.ANALYTICS })
      cacheManager.set(revenueKey, data.revenue, { ttl: CACHE_TTL.ANALYTICS })
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
        overview: cachedData.overview as AnalyticsOverview,
        users: cachedData.users as AnalyticsUsers,
        articles: cachedData.articles as AnalyticsArticles,
        revenue: cachedData.revenue as AnalyticsRevenue,
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
        overview: newData.overview as AnalyticsOverview,
        users: newData.users as AnalyticsUsers,
        articles: newData.articles as AnalyticsArticles,
        revenue: newData.revenue as AnalyticsRevenue,
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
      const keys = [
        CACHE_KEYS.ANALYTICS.OVERVIEW(period),
        CACHE_KEYS.ANALYTICS.USERS(period),
        CACHE_KEYS.ANALYTICS.ARTICLES(period),
        CACHE_KEYS.ANALYTICS.REVENUE(period)
      ]
      
      keys.forEach(key => cacheManager.delete(key))
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
    isStale: state.lastUpdated ? Date.now() - state.lastUpdated.getTime() > CACHE_TTL.ANALYTICS : false
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