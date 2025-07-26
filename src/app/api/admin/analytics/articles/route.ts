import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

// Types for Prisma groupBy results
type CategoryGroupBy = {
  categoryId: string
  _count: { id: number }
  _avg: { price: number | null }
}

type StatusGroupBy = {
  isAvailable: boolean
  _count: { id: number }
  _sum: { views: number | null }
}

type ConditionGroupBy = {
  condition: string
  _count: { id: number }
  _avg: { price: number | null }
}

type TimeGroupBy = {
  createdAt: Date
  _count: { id: number }
  _avg: { price: number | null }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const days = parseInt(period)
    
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    // Statistiques articles détaillées
    const [articleStats, articlesByCategory, articlesByCondition, articlesByStatus, articlesOverTime] = await Promise.all([
      // Statistiques générales
      prisma.article.aggregate({
        _count: {
          id: true
        },
        _avg: {
          price: true,
          views: true
        },
        _sum: {
          views: true
        }
      }),
      
      // Répartition par catégorie
      prisma.article.groupBy({
        by: ['categoryId'],
        _count: {
          id: true
        },
        _avg: {
          price: true
        }
      }),
      
      // Répartition par condition
      prisma.article.groupBy({
        by: ['condition'],
        _count: {
          id: true
        },
        _avg: {
          price: true
        }
      }),
      
      // Répartition par statut (disponible/vendu)
      prisma.article.groupBy({
        by: ['isAvailable'],
        _count: {
          id: true
        },
        _sum: {
          views: true
        }
      }),
      
      // Articles créés par jour
      prisma.article.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        },
        _avg: {
          price: true
        }
      })
    ])

    // Articles les plus vus
    const topViewedArticles = await prisma.article.findMany({
      orderBy: {
        views: 'desc'
      },
      take: 10,
      include: {
        category: {
          select: {
            name: true
          }
        },
        seller: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            favorites: true,
            reviews: true
          }
        }
      }
    })

    // Articles les plus chers
    const mostExpensiveArticles = await prisma.article.findMany({
      where: {
        isAvailable: true
      },
      orderBy: {
        price: 'desc'
      },
      take: 10,
      include: {
        category: {
          select: {
            name: true
          }
        },
        seller: {
          select: {
            name: true
          }
        }
      }
    })

    // Articles récemment vendus
    const recentlySoldArticles = await prisma.article.findMany({
      where: {
        isAvailable: false,
        updatedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10,
      include: {
        category: {
          select: {
            name: true
          }
        },
        seller: {
          select: {
            name: true
          }
        }
      }
    })

    // Enrichir les données de catégorie
    const enrichedCategoryData = await Promise.all(
      (articlesByCategory as CategoryGroupBy[]).map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true }
        })
        return {
          categoryId: item.categoryId,
          categoryName: category?.name || 'Inconnu',
          count: item._count?.id || 0,
          averagePrice: item._avg?.price || 0
        }
      })
    )

    // Calculs de performance
    const totalArticles = articleStats._count?.id || 0
    const availableArticles = (articlesByStatus as StatusGroupBy[]).find(item => item.isAvailable)?._count?.id || 0
    const soldArticles = (articlesByStatus as StatusGroupBy[]).find(item => !item.isAvailable)?._count?.id || 0
    const conversionRate = totalArticles > 0 ? (soldArticles / totalArticles) * 100 : 0

    // Formatage des données
    const formattedData = {
      overview: {
        totalArticles,
        availableArticles,
        soldArticles,
        averagePrice: articleStats._avg.price || 0,
        totalViews: articleStats._sum.views || 0,
        averageViews: articleStats._avg.views || 0,
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      
      distribution: {
        byCategory: enrichedCategoryData,
        byCondition: (articlesByCondition as ConditionGroupBy[]).map(item => ({
          condition: item.condition,
          count: item._count?.id || 0,
          averagePrice: item._avg?.price || 0
        })),
        byStatus: (articlesByStatus as StatusGroupBy[]).map(item => ({
          status: item.isAvailable ? 'AVAILABLE' : 'SOLD',
          count: item._count?.id || 0,
          totalViews: item._sum?.views || 0
        }))
      },
      
      chartData: {
        articlesOverTime: (articlesOverTime as TimeGroupBy[]).map(item => ({
          date: format(new Date(item.createdAt), 'yyyy-MM-dd'),
          count: item._count?.id || 0,
          averagePrice: item._avg?.price || 0
        }))
      },
      
      topArticles: {
        mostViewed: topViewedArticles.map(article => ({
          id: article.id,
          title: article.title,
          price: article.price,
          views: article.views || 0,
          favorites: article._count?.favorites || 0,
          reviews: article._count?.reviews || 0,
          category: article.category.name,
          seller: article.seller.name,
          isAvailable: article.isAvailable
        })),
        mostExpensive: mostExpensiveArticles.map(article => ({
          id: article.id,
          title: article.title,
          price: article.price,
          category: article.category.name,
          seller: article.seller.name
        })),
        recentlySold: recentlySoldArticles.map(article => ({
          id: article.id,
          title: article.title,
          price: article.price,
          soldAt: article.updatedAt,
          category: article.category.name,
          seller: article.seller.name
        }))
      },
      
      period: days
    }

    return NextResponse.json(formattedData)

  } catch (error) {
    console.error('Erreur API analytics articles:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}