import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { favoriteFilterSchema } from '@/lib/validations/favorite'
import { ArticleStatus } from '@prisma/client'

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
    const validatedParams = favoriteFilterSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: searchParams.get('sortBy') || 'date_desc',
      categoryId: searchParams.get('categoryId') || undefined,
    })

    const skip = (validatedParams.page - 1) * validatedParams.limit

    // Build where clause
    const where = {
      userId: session.user.id,
      article: {
        isAvailable: true,
        status: 'APPROVED' as ArticleStatus,
        ...(validatedParams.categoryId && { categoryId: validatedParams.categoryId })
      }
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

    // Get favorites with pagination
    const [favorites, totalCount] = await Promise.all([
      prisma.favorite.findMany({
        where,
        include: {
          article: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  location: true,
                  whatsappNumber: true
                }
              },
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
            }
          }
        },
        orderBy,
        skip,
        take: validatedParams.limit
      }),
      prisma.favorite.count({ where })
    ])

    // Format response
    const formattedFavorites = favorites.map(favorite => ({
      id: favorite.id,
      createdAt: favorite.createdAt,
      article: favorite.article
    }))

    const totalPages = Math.ceil(totalCount / validatedParams.limit)

    return NextResponse.json({
      favorites: formattedFavorites,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: totalCount,
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