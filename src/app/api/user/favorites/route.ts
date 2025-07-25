import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { favoriteFilterSchema } from '@/lib/validations/favorite'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'date_desc'
    const categoryId = searchParams.get('categoryId') || undefined

    // Validate parameters
    const validatedParams = favoriteFilterSchema.parse({
      page,
      limit,
      sortBy,
      categoryId,
      userId: session.user.id
    })

    // Build where clause
    const where: {
      userId: string;
      article: {
        isAvailable: boolean;
        categoryId?: string;
      };
    } = {
      userId: session.user.id,
      article: {
        isAvailable: true,
      },
    }

    if (validatedParams.categoryId) {
      where.article.categoryId = validatedParams.categoryId
    }

    // Build orderBy clause
    let orderBy: {
      createdAt?: 'desc' | 'asc';
      article?: {
        title?: 'desc' | 'asc';
        price?: 'desc' | 'asc';
        createdAt?: 'desc' | 'asc';
      };
    } = { createdAt: 'desc' }
    
    switch (validatedParams.sortBy) {
      case 'date_asc':
        orderBy = { createdAt: 'asc' }
        break
      case 'date_desc':
        orderBy = { createdAt: 'desc' }
        break
      case 'price_asc':
        orderBy = { article: { price: 'asc' } }
        break
      case 'price_desc':
        orderBy = { article: { price: 'desc' } }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get total count
    const total = await prisma.favorite.count({ where })
    
    // Calculate pagination
    const totalPages = Math.ceil(total / validatedParams.limit)
    const skip = (validatedParams.page - 1) * validatedParams.limit

    // Fetch favorites with pagination
    const favorites = await prisma.favorite.findMany({
      where,
      include: {
        article: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                image: true,
                whatsappNumber: true
              }
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            _count: {
              select: {
                favorites: true,
                reviews: true
              }
            }
          }
        }
      },
      orderBy,
      skip,
      take: validatedParams.limit
    })

    // Calculate average rating for each article
    const favoritesWithRating = await Promise.all(
      favorites.map(async (favorite) => {
        const avgRating = await prisma.review.aggregate({
          where: { articleId: favorite.article.id },
          _avg: { rating: true }
        })

        return {
          ...favorite,
          article: {
            ...favorite.article,
            averageRating: avgRating._avg.rating || undefined
          }
        }
      })
    )

    return NextResponse.json({
      favorites: favoritesWithRating,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages,
        hasNext: validatedParams.page < totalPages,
        hasPrev: validatedParams.page > 1
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}