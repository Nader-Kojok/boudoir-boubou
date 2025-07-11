import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Récupérer l'article avec toutes les relations
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
            whatsappNumber: true
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

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les avis avec les informations des reviewers
    const reviews = await prisma.review.findMany({
      where: { articleId: id },
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
      }
    })

    // Calculer la note moyenne
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    // Récupérer les articles similaires (même catégorie, excluant l'article actuel)
    const similarArticles = await prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        id: { not: id },
        isAvailable: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true
          }
        },
        _count: {
          select: {
            favorites: true,
            reviews: true
          }
        }
      },
      take: 4,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer la note moyenne pour les articles similaires
    const similarArticlesWithRating = await Promise.all(
      similarArticles.map(async (similarArticle) => {
        const articleReviews = await prisma.review.findMany({
          where: { articleId: similarArticle.id },
          select: { rating: true }
        })
        
        const avgRating = articleReviews.length > 0
          ? articleReviews.reduce((sum, review) => sum + review.rating, 0) / articleReviews.length
          : 0

        return {
          ...similarArticle,
          averageRating: avgRating
        }
      })
    )

    return NextResponse.json({
      article: {
        ...article,
        averageRating
      },
      reviews,
      similarArticles: similarArticlesWithRating
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}