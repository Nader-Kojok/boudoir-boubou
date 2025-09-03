import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { safeDbOperation } from '@/lib/db-connection'

export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est un vendeur
    const user = await safeDbOperation(
      () => prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      }),
      'seller-dashboard-getUserRole'
    )

    if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const sellerId = session.user.id
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Récupérer les statistiques avec gestion sécurisée des connexions
    const [totalArticles, totalSales, thisMonthSales, lastMonthSales, totalViews, pendingModerationArticles] = await Promise.all([
      // Total des articles actifs
      safeDbOperation(
        () => prisma.article.count({
          where: {
            sellerId,
            isAvailable: true
          }
        }),
        'seller-dashboard-totalArticles'
      ),
      
      // Total des ventes - basé sur les articles réellement vendus
      safeDbOperation(
        () => prisma.article.count({
          where: {
            sellerId,
            isAvailable: false,
            status: 'APPROVED' // Seuls les articles approuvés et non disponibles sont des ventes
          }
        }),
        'seller-dashboard-totalSales'
      ),
      
      // Ventes de ce mois
      safeDbOperation(
        () => prisma.article.count({
          where: {
            sellerId,
            isAvailable: false,
            status: 'APPROVED',
            updatedAt: {
              gte: startOfMonth
            }
          }
        }),
        'seller-dashboard-thisMonthSales'
      ),
      
      // Ventes du mois dernier
      safeDbOperation(
        () => prisma.article.count({
          where: {
            sellerId,
            isAvailable: false,
            status: 'APPROVED',
            updatedAt: {
              gte: startOfLastMonth,
              lt: startOfMonth
            }
          }
        }),
        'seller-dashboard-lastMonthSales'
      ),
      
      // Total des vues réelles
      safeDbOperation(
        () => prisma.$queryRaw<Array<{ total: bigint }>>`SELECT COALESCE(SUM(views), 0) as total FROM "Article" WHERE "sellerId" = ${sellerId}`.then((result) => Number(result[0]?.total || 0)),
        'seller-dashboard-totalViews'
      ),
      
      // Articles en attente de modération
      safeDbOperation(
        () => prisma.article.count({
          where: {
            sellerId,
            status: 'PENDING_MODERATION'
          }
        }),
        'seller-dashboard-pendingModeration'
      )
    ])

    // Le revenu total n'est plus calculé automatiquement
    // car les transactions se font via WhatsApp
    const totalRevenue = 0

    // Calculer la croissance des ventes
    const salesGrowth = lastMonthSales > 0 
      ? ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100 
      : thisMonthSales > 0 ? 100 : 0

    // Récupérer les articles récents
    const recentArticles = await safeDbOperation(
      () => prisma.article.findMany({
      where: {
        sellerId,
        isAvailable: true
      },
      include: {
        category: {
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
      },
      orderBy: {
        createdAt: 'desc'
      },
        take: 5
      }),
      'seller-dashboard-recentArticles'
    )

    // Les ventes récentes ne sont plus trackées automatiquement
    // car les transactions se font via WhatsApp

    // Formater les données
    const stats = {
      totalSales,
      totalRevenue: Number(totalRevenue),
      activeArticles: totalArticles,
      totalViews: totalViews,
      thisMonthSales,
      salesGrowth: Number(salesGrowth.toFixed(1)),
      pendingModerationArticles
    }

    const formattedArticles = recentArticles.map(article => ({
      id: article.id,
      title: article.title,
      price: article.price,
      images: JSON.parse(article.images),
      condition: article.condition,
      isAvailable: article.isAvailable,
      views: article.views || 0,
      createdAt: article.createdAt.toISOString(),
      category: {
        name: article.category.name
      },
      _count: {
  
      }
    }))

    const formattedSales: Array<{
      id: string;
      amount: number;
      date: string;
      buyerName: string;
    }> = []

    return NextResponse.json({
      stats,
      recentArticles: formattedArticles,
      recentSales: formattedSales
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des données du dashboard:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}