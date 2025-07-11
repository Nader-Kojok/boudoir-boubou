import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Récupérer les informations du vendeur
    const seller = await prisma.user.findUnique({
      where: {
        id,
        role: 'SELLER'
      },
      select: {
        id: true,
        name: true,
        image: true,
        location: true,
        bio: true,
        whatsappNumber: true,
        createdAt: true,
        _count: {
          select: {
            articles: {
              where: {
                isAvailable: true
              }
            },
            reviews: true
          }
        }
      }
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Vendeur non trouvé' },
        { status: 404 }
      )
    }

    // Calculer la note moyenne du vendeur
    const reviewStats = await prisma.review.aggregate({
      where: {
        article: {
          sellerId: id
        }
      },
      _avg: {
        rating: true
      }
    })

    // Récupérer les articles du vendeur avec pagination
    const [articles, totalArticles] = await Promise.all([
      prisma.article.findMany({
        where: {
          sellerId: id,
          isAvailable: true
        },
        include: {
          category: {
            select: {
              id: true,
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
        skip,
        take: limit
      }),
      prisma.article.count({
        where: {
          sellerId: id,
          isAvailable: true
        }
      })
    ])

    // Calculer la note moyenne pour chaque article
    const articlesWithRatings = await Promise.all(
      articles.map(async (article) => {
        const avgRating = await prisma.review.aggregate({
          where: { articleId: article.id },
          _avg: { rating: true }
        })

        return {
          ...article,
          averageRating: avgRating._avg.rating || 0
        }
      })
    )

    const totalPages = Math.ceil(totalArticles / limit)

    return NextResponse.json({
      seller: {
        ...seller,
        averageRating: reviewStats._avg.rating || 0,
        _count: {
          articles: seller._count.articles,
          reviews: seller._count.reviews
        }
      },
      articles: articlesWithRatings,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalArticles,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du vendeur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}