import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db'
import { safeDbOperation } from '@/lib/db-connection'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Vérification de la santé de la connexion avant de commencer
    const isDbHealthy = await checkDatabaseConnection()
    if (!isDbHealthy) {
      return NextResponse.json(
        { error: 'Base de données indisponible' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const days = parseInt(period)
    
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    // Statistiques utilisateurs détaillées - Exécution séquentielle avec gestion des connexions
    const userStats = await safeDbOperation(
      () => prisma.user.aggregate({
        _count: {
          id: true
        }
      }),
      'userStats'
    )
    
    const usersByRole = await safeDbOperation(
      () => prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      }),
      'usersByRole'
    )
    
    const usersByStatus = await safeDbOperation(
      () => prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN "phoneVerified" IS NOT NULL THEN 'VERIFIED'
            ELSE 'UNVERIFIED'
          END as status,
          COUNT(*) as count
        FROM "User"
        GROUP BY 
          CASE 
            WHEN "phoneVerified" IS NOT NULL THEN 'VERIFIED'
            ELSE 'UNVERIFIED'
          END
      `,
      'usersByStatus'
    )
    
    const newUsersOverTime = await safeDbOperation(
      () => prisma.user.groupBy({
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
      }),
      'newUsersOverTime'
    )
    
    const activeUsersOverTime = await safeDbOperation(
      () => prisma.user.groupBy({
        by: ['updatedAt'],
        where: {
          updatedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      }),
      'activeUsersOverTime'
    )

    // Top vendeurs par nombre d'articles et ventes
    const sellersData = await safeDbOperation(
      () => prisma.$queryRaw<{
        id: string;
        name: string | null;
        phone: string;
        articlesCount: bigint;
        salesCount: bigint;
        totalRevenue: number | null;
      }[]>`
        SELECT 
          u.id,
          u.name,
          u.phone,
          COUNT(DISTINCT a.id) as "articlesCount",
          COUNT(DISTINCT p.id) as "salesCount",
          SUM(p.amount) as "totalRevenue"
        FROM "User" u
        LEFT JOIN "Article" a ON u.id = a."sellerId" AND a."isAvailable" = true
        LEFT JOIN "Payment" p ON a.id = p."articleId" AND p.status = 'COMPLETED'
        WHERE u.role = 'SELLER'
        GROUP BY u.id, u.name, u.phone
        ORDER BY "articlesCount" DESC, "salesCount" DESC
        LIMIT 10
      `,
      'sellersData'
    )

    // Utilisateurs les plus actifs (basé sur le nombre d'articles créés)
    const mostActiveUsers = await safeDbOperation(
      () => prisma.user.findMany({
        include: {
          _count: {
            select: {
              articles: true,
              reviews: true,
              favorites: true
            }
          }
        },
        orderBy: {
          articles: {
            _count: 'desc'
          }
        },
        take: 10
      }),
      'mostActiveUsers'
    )

    // Taux de rétention (utilisateurs qui se sont connectés dans les 7 derniers jours)
    const recentlyActiveUsers = await safeDbOperation(
      () => prisma.user.count({
        where: {
          updatedAt: {
            gte: subDays(new Date(), 7)
          }
        }
      }),
      'recentlyActiveUsers'
    )

    const retentionRate = (userStats._count?.id || 0) > 0 
      ? (recentlyActiveUsers / (userStats._count?.id || 1)) * 100 
      : 0

    // Formatage des données
    const formattedData = {
      overview: {
        totalUsers: userStats._count?.id || 0,
        activeUsers: recentlyActiveUsers,
        retentionRate: Math.round(retentionRate * 100) / 100,
        newUsersThisPeriod: newUsersOverTime.reduce((sum, item) => sum + (item._count?.id || 0), 0)
      },
      
      distribution: {
        byRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count?.id || 0
        })),
        byStatus: (usersByStatus as Array<{ status: string; count: bigint }>).map(item => ({
          status: item.status,
          count: Number(item.count)
        }))
      },
      
      chartData: {
        newUsers: newUsersOverTime.map(item => ({
          date: format(new Date(item.createdAt), 'yyyy-MM-dd'),
          count: item._count?.id || 0
        })),
        activeUsers: activeUsersOverTime.map(item => ({
          date: format(new Date(item.updatedAt), 'yyyy-MM-dd'),
          count: item._count?.id || 0
        }))
      },
      
      topUsers: {
        sellers: sellersData.map((seller: { id: string; name: string | null; phone: string; articlesCount: bigint; salesCount: bigint; totalRevenue: number | null }) => ({
          id: seller.id,
          name: seller.name,
          phone: seller.phone,
          articlesCount: Number(seller.articlesCount),
          salesCount: Number(seller.salesCount),
          totalRevenue: seller.totalRevenue || 0
        })),
        mostActive: mostActiveUsers.map(user => ({
          id: user.id,
          name: user.name,
          image: user.image,
          role: user.role,
          articlesCount: user._count?.articles || 0,
          reviewsCount: user._count?.reviews || 0,
          favoritesCount: user._count?.favorites || 0,
          totalActivity: (user._count?.articles || 0) + (user._count?.reviews || 0) + (user._count?.favorites || 0)
        }))
      },
      
      period: days
    }

    return NextResponse.json(formattedData)

  } catch (error) {
    console.error('Erreur API analytics users:', error)
    
    // Gestion spécifique des erreurs de connexion Prisma
    if (error instanceof Error) {
      if (error.message.includes('too many connections') || error.message.includes('connection')) {
        // Tentative de nettoyage des connexions
        try {
          await prisma.$disconnect()
        } catch (disconnectError) {
          console.error('Erreur lors de la déconnexion:', disconnectError)
        }
        
        return NextResponse.json(
          { 
            error: 'Trop de connexions à la base de données. Veuillez réessayer dans quelques instants.',
            code: 'CONNECTION_LIMIT_EXCEEDED'
          },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}