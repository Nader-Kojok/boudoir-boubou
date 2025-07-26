import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/db' // TODO: Uncomment when UserActivity model is migrated

type ActivityAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'ARTICLE_CREATE'
  | 'ARTICLE_VIEW'
  | 'ARTICLE_UPDATE'
  | 'ARTICLE_DELETE'
  | 'PURCHASE'
  | 'REVIEW_CREATE'
  | 'PROFILE_UPDATE'
  | 'SEARCH'
  | 'FAVORITE_ADD'
  | 'FAVORITE_REMOVE'
  | 'MESSAGE_SEND'
  | 'ADMIN_ACTION'

interface ActivityDetails {
  [key: string]: unknown
}

interface TrackActivityOptions {
  action: ActivityAction
  details?: ActivityDetails
  userId?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Enregistre une activité utilisateur
 */
export async function trackActivity({
  action,
  details = {},
  userId,
  // ipAddress,
  // userAgent
}: TrackActivityOptions): Promise<void> {
  try {
    // Si pas d'userId fourni, essayer de récupérer depuis la session
    let targetUserId = userId
    if (!targetUserId) {
      const session = await getServerSession(authOptions)
      targetUserId = session?.user?.id
    }

    if (!targetUserId) {
      console.warn('Impossible de tracker l\'activité: aucun utilisateur identifié')
      return
    }

    // TODO: Uncomment when UserActivity model is properly migrated
     // await prisma.userActivity.create({
     //   data: {
     //     userId: targetUserId,
     //     action,
     //     details,
     //     ipAddress: ipAddress || 'unknown',
     //     userAgent: userAgent || 'unknown'
     //   }
     // })
     
     // Temporary simulation
     console.log('Activity tracked:', {
       userId: targetUserId,
       action,
       details,
       timestamp: new Date().toISOString()
     })

  } catch (error) {
    console.error('Erreur lors du tracking d\'activité:', error)
    // Ne pas faire échouer l'opération principale si le tracking échoue
  }
}

/**
 * Hook pour tracker les activités côté client
 */
export function useActivityTracker() {
  const track = async (action: ActivityAction, details?: ActivityDetails) => {
    try {
      await fetch('/api/admin/analytics/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, details })
      })
    } catch (error) {
      console.error('Erreur lors du tracking côté client:', error)
    }
  }

  return { track }
}

/**
 * Middleware pour tracker automatiquement certaines actions
 */
export function createActivityMiddleware() {
  return async (request: Request, context: { next: () => unknown }) => {
    const url = new URL(request.url)
    const method = request.method
    // const userAgent = request.headers.get('user-agent') || 'unknown'
    // const ipAddress = request.headers.get('x-forwarded-for') || 
    //                  request.headers.get('x-real-ip') || 
    //                  'unknown'

    // Déterminer l'action basée sur la route et la méthode
    let action: ActivityAction | null = null
    const details: ActivityDetails = {
      path: url.pathname,
      method
    }

    // Mapping des routes vers les actions
    if (url.pathname.includes('/api/articles') && method === 'POST') {
      action = 'ARTICLE_CREATE'
    } else if (url.pathname.includes('/api/articles') && method === 'PUT') {
      action = 'ARTICLE_UPDATE'
    } else if (url.pathname.includes('/api/articles') && method === 'DELETE') {
      action = 'ARTICLE_DELETE'
    } else if (url.pathname.includes('/api/payments') && method === 'POST') {
      action = 'PURCHASE'
    } else if (url.pathname.includes('/api/reviews') && method === 'POST') {
      action = 'REVIEW_CREATE'
    } else if (url.pathname.includes('/api/favorites') && method === 'POST') {
      action = 'FAVORITE_ADD'
    } else if (url.pathname.includes('/api/favorites') && method === 'DELETE') {
      action = 'FAVORITE_REMOVE'
    } else if (url.pathname.includes('/api/search')) {
      action = 'SEARCH'
      // Ajouter les paramètres de recherche aux détails
      const searchParams = url.searchParams
      details.query = searchParams.get('q')
      details.category = searchParams.get('category')
      details.filters = Object.fromEntries(searchParams.entries())
    }

    // Tracker l'activité si une action a été identifiée
    if (action) {
      // Exécuter le tracking en arrière-plan
      trackActivity({
        action,
        details
        // ipAddress,
        // userAgent
      }).catch(error => {
        console.error('Erreur middleware tracking:', error)
      })
    }

    return context.next()
  }
}

/**
 * Utilitaires pour les statistiques d'activité
 */
export class ActivityAnalytics {
  /**
   * Obtient les activités les plus fréquentes
   */
  static async getTopActivities(timeframe: '24h' | '7d' | '30d' = '7d') {
    const startDate = new Date()
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
    }

    // TODO: Activer après migration
    // const activities = await prisma.userActivity.groupBy({
    //   by: ['action'],
    //   where: {
    //     createdAt: {
    //       gte: startDate
    //     }
    //   },
    //   _count: {
    //     action: true
    //   },
    //   orderBy: {
    //     _count: {
    //       action: 'desc'
    //     }
    //   }
    // })

    // Données simulées
    return [
      { action: 'ARTICLE_VIEW', count: 1250 },
      { action: 'SEARCH', count: 890 },
      { action: 'LOGIN', count: 456 },
      { action: 'FAVORITE_ADD', count: 234 },
      { action: 'PURCHASE', count: 123 }
    ]
  }

  /**
   * Obtient les utilisateurs les plus actifs
   */
  static async getMostActiveUsers() {
    // TODO: Activer après migration
    // const users = await prisma.userActivity.groupBy({
    //   by: ['userId'],
    //   _count: {
    //     userId: true
    //   },
    //   orderBy: {
    //     _count: {
    //       userId: 'desc'
    //     }
    //   },
    //   take: 10
    // })

    // Données simulées
    return [
      { userId: 'user1', activityCount: 45, name: 'John Doe' },
      { userId: 'user2', activityCount: 38, name: 'Jane Smith' },
      { userId: 'user3', activityCount: 32, name: 'Bob Johnson' }
    ]
  }

  /**
   * Obtient les tendances d'activité par heure
   */
  static async getHourlyTrends(date: Date = new Date()) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // TODO: Implémenter avec Prisma après migration
    // Simulation des données par heure
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: Math.floor(Math.random() * 100) + 10
    }))

    return hourlyData
  }
}