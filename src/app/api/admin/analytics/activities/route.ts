import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Mock data for activities - removed unused variable

    // Construction des filtres
    const where: Record<string, unknown> = {}

    if (userId) {
      where.userId = userId
    }

    if (action) {
      where.action = action
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // TODO: Activer après migration des modèles UserActivity
    // const [activities, totalCount] = await Promise.all([
    //   prisma.userActivity.findMany({
    //     where,
    //     skip,
    //     take: limit,
    //     orderBy: {
    //       createdAt: 'desc'
    //     },
    //     include: {
    //       user: {
    //         select: {
    //           id: true,
    //           name: true,
    //           phone: true,
    //           role: true
    //         }
    //       }
    //     }
    //   }),
    //   prisma.userActivity.count({ where })
    // ])

    // Données simulées en attendant la migration
    const activities = [
      {
        id: '1',
        userId: 'user1',
        action: 'LOGIN',
        details: { ip: '192.168.1.1', userAgent: 'Chrome' },
        createdAt: new Date(),
        user: {
          id: 'user1',
          name: 'John Doe',
          phone: '+221701234567',
          role: 'BUYER'
        }
      },
      {
        id: '2',
        userId: 'user2',
        action: 'ARTICLE_CREATE',
        details: { articleId: 'article1', title: 'Robe élégante' },
        createdAt: new Date(Date.now() - 3600000),
        user: {
          id: 'user2',
          name: 'Jane Smith',
          phone: '+221701234568',
          role: 'SELLER'
        }
      }
    ]
    
    const totalCount = 2
    const totalPages = Math.ceil(totalCount / limit)

    // Statistiques d'activité
    const stats = {
      totalActivities: totalCount,
      uniqueUsers: new Set(activities.map(a => a.userId)).size,
      actionBreakdown: {
        LOGIN: activities.filter(a => a.action === 'LOGIN').length,
        ARTICLE_CREATE: activities.filter(a => a.action === 'ARTICLE_CREATE').length,
        ARTICLE_VIEW: activities.filter(a => a.action === 'ARTICLE_VIEW').length,
        PURCHASE: activities.filter(a => a.action === 'PURCHASE').length
      },
      timeRange: {
        start: startDate || activities[activities.length - 1]?.createdAt,
        end: endDate || activities[0]?.createdAt
      }
    }

    return NextResponse.json({
      activities,
      stats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Erreur API admin activities:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, details } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action requise' },
        { status: 400 }
      )
    }

    // TODO: Activer après migration du modèle UserActivity
    // const activity = await prisma.userActivity.create({
    //   data: {
    //     userId: session.user.id,
    //     action,
    //     details: details || {},
    //     ipAddress: request.headers.get('x-forwarded-for') || 
    //                request.headers.get('x-real-ip') || 
    //                'unknown',
    //     userAgent: request.headers.get('user-agent') || 'unknown'
    //   }
    // })

    // Simulation en attendant la migration
    const activity = {
      id: Date.now().toString(),
      userId: session.user.id,
      action,
      details: details || {},
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      createdAt: new Date()
    }

    return NextResponse.json({
      message: 'Activité enregistrée',
      activity
    })

  } catch (error) {
    console.error('Erreur API admin activities POST:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}