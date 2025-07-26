import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

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
    const period = searchParams.get('period') || '30' // jours
    const days = parseInt(period)
    
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    // Métriques générales
    const [totalUsers, totalArticles, totalSales, totalRevenue] = await Promise.all([
      // Total utilisateurs
      prisma.user.count(),
      
      // Total articles
      prisma.article.count(),
      
      // Total ventes
      prisma.payment.count({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Revenus totaux
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      })
    ])

    // Nouveaux utilisateurs par jour
    const newUsersData = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })

    // Articles créés par jour
    const newArticlesData = await prisma.article.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })

    // Ventes par jour
    const salesData = await prisma.payment.groupBy({
      by: ['completedAt'],
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })

    // Utilisateurs actifs (connectés dans les 30 derniers jours)
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: subDays(new Date(), 30)
        }
      }
    })

    // Articles les plus vus
    const topArticles = await prisma.article.findMany({
      take: 5,
      orderBy: {
        views: 'desc'
      },
      include: {
        seller: {
          select: {
            name: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      }
    })

    // Taux de conversion (utilisateurs qui ont acheté / total utilisateurs)
    const buyersCount = await prisma.user.count({
      where: {
        payments: {
          some: {
            status: 'COMPLETED'
          }
        }
      }
    })

    const conversionRate = totalUsers > 0 ? (buyersCount / totalUsers) * 100 : 0

    // Formatage des données pour les graphiques
    const chartData: {
      newUsers: Array<{ date: string; count: number }>;
      newArticles: Array<{ date: string; count: number }>;
      sales: Array<{ date: string; count: number; revenue: number }>;
    } = {
      newUsers: newUsersData.map((item: { createdAt: Date; _count: { id: number } }) => ({
        date: format(new Date(item.createdAt), 'yyyy-MM-dd'),
        count: item._count?.id || 0
      })),
      newArticles: newArticlesData.map((item: { createdAt: Date; _count: { id: number } }) => ({
        date: format(new Date(item.createdAt), 'yyyy-MM-dd'),
        count: item._count?.id || 0
      })),
      sales: salesData.map((item: { completedAt: Date | null; _count: { id: number }; _sum: { amount: number | null } }) => ({
        date: format(new Date(item.completedAt!), 'yyyy-MM-dd'),
        count: item._count?.id || 0,
        revenue: item._sum.amount || 0
      }))
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        totalArticles,
        totalSales,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeUsers,
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      chartData,
      topArticles,
      period: days
    })

  } catch (error) {
    console.error('Erreur API analytics overview:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}