import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startOfDay, endOfDay, subDays, format, startOfMonth, endOfMonth } from 'date-fns'

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
    const currentMonth = new Date()
    const lastMonth = subDays(startOfMonth(currentMonth), 1)

    // Statistiques de revenus détaillées
    const [revenueStats, revenueByMethod, revenueOverTime, monthlyRevenue, lastMonthRevenue] = await Promise.all([
      // Statistiques générales des paiements
      prisma.payment.aggregate({
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
        },
        _avg: {
          amount: true
        }
      }),
      
      // Répartition par méthode de paiement
      prisma.payment.groupBy({
        by: ['method'],
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
      }),
      
      // Revenus par jour
      prisma.payment.groupBy({
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
      }),
      
      // Revenus du mois en cours
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: startOfMonth(currentMonth),
            lte: endOfMonth(currentMonth)
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),
      
      // Revenus du mois dernier
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: startOfMonth(lastMonth),
            lte: endOfMonth(lastMonth)
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      })
    ])

    // Top vendeurs par revenus
    const topSellersByRevenue = await prisma.payment.groupBy({
      by: ['userId'],
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 10
    })

    // Enrichir les données des vendeurs
    const enrichedSellersData = await Promise.all(
      topSellersByRevenue.map(async (item) => {
        const seller = await prisma.user.findUnique({
          where: { id: item.userId },
          select: { 
            name: true,
            image: true,
            location: true
          }
        })
        return {
          sellerId: item.userId,
          sellerName: seller?.name || 'Inconnu',
          sellerImage: seller?.image,
          sellerLocation: seller?.location,
          totalRevenue: item._sum.amount || 0,
          transactionCount: item._count?.id || 0
        }
      })
    )

    // Revenus par catégorie (via les articles vendus)
    const revenueByCategory = await prisma.$queryRaw`
      SELECT 
        c."name" as "categoryName",
        c."id" as "categoryId",
        COUNT(p."id") as "transactionCount",
        SUM(p."amount") as "totalRevenue",
        AVG(p."amount") as "averageRevenue"
      FROM "Payment" p
      JOIN "Article" a ON p."articleId" = a."id"
      JOIN "Category" c ON a."categoryId" = c."id"
      WHERE p."status" = 'COMPLETED'
        AND p."completedAt" >= ${startDate}
        AND p."completedAt" <= ${endDate}
      GROUP BY c."id", c."name"
      ORDER BY "totalRevenue" DESC
    `

    // Transactions récentes
    const recentTransactions = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 20,
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        },
        article: {
          select: {
            title: true,
            seller: {
              select: {
                name: true,
                image: true
              }
            },
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Calculs de croissance
    const currentMonthRevenue = monthlyRevenue._sum.amount || 0
    const lastMonthRevenueAmount = lastMonthRevenue._sum.amount || 0
    const revenueGrowth = lastMonthRevenueAmount > 0 
      ? ((currentMonthRevenue - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100 
      : currentMonthRevenue > 0 ? 100 : 0

    // Formatage des données
    const formattedData = {
      overview: {
        totalRevenue: revenueStats._sum.amount || 0,
        totalTransactions: revenueStats._count?.id || 0,
        averageTransactionValue: revenueStats._avg.amount || 0,
        currentMonthRevenue,
        lastMonthRevenue: lastMonthRevenueAmount,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        currentMonthTransactions: monthlyRevenue._count?.id || 0,
        lastMonthTransactions: lastMonthRevenue._count?.id || 0
      },
      
      distribution: {
        byPaymentMethod: revenueByMethod.map((item: { method: string; _count: { id: number } | null; _sum: { amount: number | null } | null }) => ({
          method: item.method,
          count: item._count?.id || 0,
          totalRevenue: item._sum?.amount || 0,
          percentage: revenueStats._sum.amount ? 
            ((item._sum?.amount || 0) / (revenueStats._sum.amount || 1)) * 100 : 0
        })),
        byCategory: (revenueByCategory as { categoryId: string; categoryName: string; transactionCount: bigint; totalRevenue: number; averageRevenue: number }[]).map(item => ({
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          transactionCount: Number(item.transactionCount),
          totalRevenue: Number(item.totalRevenue || 0),
          averageRevenue: Number(item.averageRevenue || 0)
        }))
      },
      
      chartData: {
        revenueOverTime: revenueOverTime.map((item: { completedAt: Date | null; _sum: { amount: number | null } | null; _count: { id: number } | null }) => ({
          date: format(new Date(item.completedAt!), 'yyyy-MM-dd'),
          revenue: item._sum?.amount || 0,
          transactions: item._count?.id || 0
        }))
      },
      
      topPerformers: {
        sellers: enrichedSellersData,
        categories: (revenueByCategory as { categoryName: string; totalRevenue: number; transactionCount: bigint }[]).slice(0, 5).map(item => ({
          categoryName: item.categoryName,
          totalRevenue: Number(item.totalRevenue || 0),
          transactionCount: Number(item.transactionCount)
        }))
      },
      
      recentTransactions: recentTransactions.map(transaction => ({
        id: transaction.id,
        amount: transaction.amount,
        method: transaction.method,
        completedAt: transaction.completedAt,
        buyer: {
          name: transaction.user.name,
          image: transaction.user.image
        },
        seller: {
          name: transaction.article.seller.name,
          image: transaction.article.seller.image
        },
        article: {
          title: transaction.article.title,
          category: transaction.article.category.name
        }
      })),
      
      period: days
    }

    return NextResponse.json(formattedData)

  } catch (error) {
    console.error('Erreur API analytics revenue:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}