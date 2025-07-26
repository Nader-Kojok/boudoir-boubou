import { unstable_cache } from 'next/cache'

// Cache pour les données analytics avec TTL de 5 minutes
export const getCachedAnalytics = unstable_cache(
  async (endpoint: string, period: string) => {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/analytics/${endpoint}?period=${period}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint} analytics`)
    }
    
    return response.json()
  },
  ['analytics'],
  {
    revalidate: 300, // 5 minutes
    tags: ['analytics']
  }
)

// Cache spécialisé pour les données utilisateurs
export const getCachedUserAnalytics = unstable_cache(
  async (period: string) => {
    return getCachedAnalytics('users', period)
  },
  ['user-analytics'],
  {
    revalidate: 300,
    tags: ['analytics', 'users']
  }
)

// Cache spécialisé pour les données articles
export const getCachedArticleAnalytics = unstable_cache(
  async (period: string) => {
    return getCachedAnalytics('articles', period)
  },
  ['article-analytics'],
  {
    revalidate: 300,
    tags: ['analytics', 'articles']
  }
)

// Cache spécialisé pour les données revenus
export const getCachedRevenueAnalytics = unstable_cache(
  async (period: string) => {
    return getCachedAnalytics('revenue', period)
  },
  ['revenue-analytics'],
  {
    revalidate: 300,
    tags: ['analytics', 'revenue']
  }
)

// Fonction pour invalider le cache analytics
export async function revalidateAnalyticsCache() {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('analytics')
}

// Fonction pour invalider des caches spécifiques
export async function revalidateSpecificCache(type: 'users' | 'articles' | 'revenue') {
  const { revalidateTag } = await import('next/cache')
  revalidateTag(type)
}

// Utilitaire pour la gestion des erreurs de cache
export function handleCacheError(error: unknown, fallbackData: unknown = null) {
  console.error('Cache error:', error)
  return fallbackData
}

// Configuration des périodes de cache selon la fréquence d'utilisation
export const CACHE_CONFIG = {
  overview: { revalidate: 180 }, // 3 minutes - données principales
  users: { revalidate: 300 },    // 5 minutes - données utilisateurs
  articles: { revalidate: 240 }, // 4 minutes - données articles
  revenue: { revalidate: 120 },  // 2 minutes - données revenus (plus critiques)
  activities: { revalidate: 60 } // 1 minute - activités récentes
}