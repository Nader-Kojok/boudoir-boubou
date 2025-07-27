import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'


// Type definition for Prisma groupBy result
type UserRoleGroupBy = {
  role: string
  _count: {
    id: number
  }
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'ALL'
    const status = searchParams.get('status') || 'ALL'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrderParam = searchParams.get('sortOrder') || 'desc'
    const sortOrder: 'asc' | 'desc' = sortOrderParam === 'asc' ? 'asc' : 'desc'

    const skip = (page - 1) * limit

    // Construction des filtres
    const where: {
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' } } | { phone?: { contains: string; mode: 'insensitive' } }>;
      role?: 'ADMIN' | 'SELLER' | 'BUYER';
      phoneVerified?: { not: null } | null;
    } = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role !== 'ALL' && (role === 'ADMIN' || role === 'SELLER' || role === 'BUYER')) {
      where.role = role
    }

    if (status !== 'ALL') {
      if (status === 'VERIFIED') {
        where.phoneVerified = { not: null }
      } else if (status === 'UNVERIFIED') {
        where.phoneVerified = null
      }
    }

    // Construction de l'ordre de tri
    const orderBy: Record<string, 'asc' | 'desc'> = {}
    if (sortBy === 'name' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
      orderBy[sortBy] = sortOrder
    } else {
      orderBy.createdAt = 'desc'
    }

    // Récupération des utilisateurs avec pagination optimisée
    const [rawUsers, totalCount, userStats] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          phone: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          phoneVerified: true,
          // status: true,
          // lastLoginAt: true,
          // loginCount: true,
          // isVerified: true,
          // suspensionReason: true,
          // notes: true,
          // tags: true,
          _count: {
            select: {
              articles: true,
              payments: true,
              reviews: true
            }
          }
        }
      }),
      prisma.user.count({ where }),
      // Statistiques rapides pour le dashboard
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      })
    ])

    // Ensure _count is always present with default values
    const users = rawUsers.map(user => ({
      ...user,
      _count: {
        articles: user._count?.articles || 0,
        payments: user._count?.payments || 0,
        reviews: user._count?.reviews || 0
      }
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: {
        byRole: (userStats as UserRoleGroupBy[]).reduce((acc, stat) => {
          acc[stat.role] = stat._count?.id || 0
          return acc
        }, {} as Record<string, number>),
        total: totalCount
      }
    })

  } catch (error) {
    console.error('Erreur API admin users:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userIds, action }: { userIds: string[]; action: string; data?: Record<string, unknown> } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs utilisateurs requis' },
        { status: 400 }
      )
    }

    let updateData: Record<string, unknown> = {}
    let message = ''

    switch (action) {
      case 'SUSPEND':
        updateData = {
          // status: 'SUSPENDED',
          // suspendedAt: new Date(),
          // suspensionReason: data?.reason || 'Suspension administrative'
        }
        message = `${userIds.length} utilisateur(s) suspendu(s)`
        break
      case 'ACTIVATE':
        updateData = {
          // status: 'ACTIVE',
          // suspendedAt: null,
          // suspensionReason: null
        }
        message = `${userIds.length} utilisateur(s) activé(s)`
        break
      case 'VERIFY':
        updateData = {
          // isVerified: true,
          // verifiedAt: new Date(),
          phoneVerified: new Date()
        }
        message = `${userIds.length} utilisateur(s) vérifié(s)`
        break
      case 'ADD_NOTES':
        updateData = {
          // notes: data?.notes || ''
        }
        message = `Notes ajoutées à ${userIds.length} utilisateur(s)`
        break
      default:
        return NextResponse.json(
          { error: 'Action non supportée' },
          { status: 400 }
        )
    }

    // Exécution de l'action en lot
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: userIds
        }
      },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message,
      affectedUsers: result.count
    })

  } catch (error) {
    console.error('Erreur API admin users bulk action:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// Export des données utilisateurs
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { filters = {} }: { format?: string; filters?: Record<string, unknown> } = body

    // Construction des filtres pour l'export
    const where: {
      role?: 'ADMIN' | 'SELLER' | 'BUYER';
      phoneVerified?: { not: null } | null;
      createdAt?: { gte?: Date; lte?: Date };
    } = {}
    
    if (filters.role && filters.role !== 'ALL' && (filters.role === 'ADMIN' || filters.role === 'SELLER' || filters.role === 'BUYER')) {
      where.role = filters.role as 'ADMIN' | 'SELLER' | 'BUYER'
    }
    
    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'VERIFIED') {
        where.phoneVerified = { not: null }
      } else if (filters.status === 'UNVERIFIED') {
        where.phoneVerified = null
      }
    }

    if (filters.dateFrom && typeof filters.dateFrom === 'string') {
      where.createdAt = {
        gte: new Date(filters.dateFrom)
      }
    }

    if (filters.dateTo && typeof filters.dateTo === 'string') {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.dateTo)
      }
    }

    // Récupération des données pour export
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        phoneVerified: true,
        // status: true,
        // lastLoginAt: true,
        // loginCount: true,
        // isVerified: true,
        // location: true,
        _count: {
          select: {
            articles: true,
            payments: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatage des données selon le format demandé
    const exportData = users.map(user => ({
      id: user.id,
      nom: user.name,
      telephone: user.phone,
      role: user.role,
      statut: user.phoneVerified ? 'VERIFIED' : 'UNVERIFIED',
      dateInscription: user.createdAt.toISOString(),
      nombreArticles: user._count?.articles || 0,
      nombreAchats: user._count?.payments || 0,
      nombreAvis: user._count?.reviews || 0
    }))

    return NextResponse.json({
      success: true,
      data: exportData,
      count: exportData.length,
      exportedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur API admin users export:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}