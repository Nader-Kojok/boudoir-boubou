import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const { id: articleId } = params
    const body = await request.json()
    
    // Validation des données
    const validatedData = createReviewSchema.parse(body)

    // Vérifier que l'article existe
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur n'a pas déjà laissé un avis
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewerId_articleId: {
          reviewerId: session.user.id,
          articleId: articleId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Vous avez déjà laissé un avis pour cet article' },
        { status: 400 }
      )
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        reviewerId: session.user.id,
        articleId: articleId
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(review, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de la création de l\'avis:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: articleId } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Vérifier que l'article existe
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les avis avec pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { articleId },
        include: {
          reviewer: {
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
      prisma.review.count({
        where: { articleId }
      })
    ])

    // Calculer la note moyenne
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    // Calculer la distribution des notes
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { articleId },
      _count: {
        rating: true
      }
    })

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDistribution.forEach(item => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating
    })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      statistics: {
        averageRating,
        totalReviews: totalCount,
        distribution
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}