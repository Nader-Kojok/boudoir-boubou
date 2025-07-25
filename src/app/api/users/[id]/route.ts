import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type ArticleWithRating = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string;
  condition: string;
  isAvailable: boolean;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  };
  _count: {
    favorites: number;
    reviews: number;
  };
  averageRating: number | null;
}

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

    // Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        name: true,
        image: true,
        bannerImage: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            articles: {
              where: {
                isAvailable: true
              }
            },
            reviews: true,
            favorites: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    let articles: ArticleWithRating[] = []
    let totalArticles = 0
    let averageRating: number | null = null

    // Si l'utilisateur est un vendeur, récupérer ses articles
    if (user.role === 'SELLER') {
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

      averageRating = reviewStats._avg.rating

      // Récupérer les articles du vendeur avec pagination
      const [userArticles, totalCount] = await Promise.all([
        prisma.article.findMany({
          where: {
            sellerId: id,
            isAvailable: true
          },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            images: true,
            condition: true,
            isAvailable: true,
            createdAt: true,
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
      const articlesWithRating = await Promise.all(
        userArticles.map(async (article) => {
          const articleReviewStats = await prisma.review.aggregate({
            where: {
              articleId: article.id
            },
            _avg: {
              rating: true
            }
          })

          return {
            ...article,
            averageRating: articleReviewStats._avg.rating
          }
        })
      )

      articles = articlesWithRating
      totalArticles = totalCount
    }

    const totalPages = Math.ceil(totalArticles / limit)

    return NextResponse.json({
      user: {
        ...user,
        averageRating
      },
      articles,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalArticles,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}