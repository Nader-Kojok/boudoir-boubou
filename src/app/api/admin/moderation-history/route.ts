import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schéma de validation pour les filtres
const historyFiltersSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  action: z.enum(['APPROVE', 'REJECT']).optional(),
  moderatorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional()
})

// GET - Récupérer l'historique des actions de modération
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est un admin ou modérateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filters = historyFiltersSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      action: searchParams.get('action'),
      moderatorId: searchParams.get('moderatorId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      search: searchParams.get('search')
    })

    const page = parseInt(filters.page)
    const limit = parseInt(filters.limit)
    const skip = (page - 1) * limit

    // Construire les conditions de filtrage
    const where: {
      action?: string
      moderatorId?: string
      createdAt?: {
        gte?: Date
        lte?: Date
      }
      notes?: {
        contains: string
        mode: 'insensitive'
      }
      OR?: Array<{
        article?: {
          title?: {
            contains: string
            mode: 'insensitive'
          }
        }
        moderator?: {
          name?: {
            contains: string
            mode: 'insensitive'
          }
        }
      }>
    } = {}

    if (filters.action) {
      where.action = filters.action
    }

    if (filters.moderatorId) {
      where.moderatorId = filters.moderatorId
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate)
      }
    }

    // Recherche dans les notes
    if (filters.search) {
      where.notes = {
        contains: filters.search,
        mode: 'insensitive'
      }
    }

    // Récupérer les logs avec pagination
    const [logs, total] = await Promise.all([
      prisma.moderationLog.findMany({
        where,
        include: {
          moderator: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.moderationLog.count({ where })
    ])

    // Récupérer les informations des articles associés
    const articleIds = logs.map(log => log.articleId)
    const articles = await prisma.article.findMany({
      where: {
        id: {
          in: articleIds
        }
      },
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        seller: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Créer un map des articles pour un accès rapide
    const articleMap = new Map(articles.map(article => [article.id, article]))

    // Formater les données
    const formattedLogs = logs.map(log => ({
      ...log,
      article: articleMap.get(log.articleId) || null
    }))

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Paramètres invalides',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    )
  }
}