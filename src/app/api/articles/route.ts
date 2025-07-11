import { NextRequest, NextResponse } from 'next/server'
import { getArticles } from '@/lib/db'
import { ArticleCondition } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const search = searchParams.get('search') || undefined
    const categoryId = searchParams.get('categoryId') || undefined
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const condition = searchParams.get('condition') as ArticleCondition | undefined
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    // Build filters object
    const filters: {
      search?: string;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      condition?: ArticleCondition;
    } = {}
    
    if (search) filters.search = search
    if (categoryId) filters.categoryId = categoryId
    if (minPrice) filters.minPrice = parseFloat(minPrice)
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice)
    if (condition && ['EXCELLENT', 'GOOD', 'FAIR'].includes(condition)) {
      filters.condition = condition
    }
    
    // Get articles with filters
    const allArticles = await getArticles(filters)
    
    // Apply sorting
    const sortedArticles = [...allArticles]
    switch (sortBy) {
      case 'oldest':
        sortedArticles.sort((a, b) => {
          const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt as Date
          const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt as Date
          return dateA.getTime() - dateB.getTime()
        })
        break
      case 'price-asc':
        sortedArticles.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : 0
          const priceB = typeof b.price === 'number' ? b.price : 0
          return priceA - priceB
        })
        break
      case 'price-desc':
        sortedArticles.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : 0
          const priceB = typeof b.price === 'number' ? b.price : 0
          return priceB - priceA
        })
        break
      case 'popular':
        sortedArticles.sort((a, b) => {
          const favoritesA = (a as { _count?: { favorites?: number } })._count?.favorites || 0
          const favoritesB = (b as { _count?: { favorites?: number } })._count?.favorites || 0
          return favoritesB - favoritesA
        })
        break
      case 'newest':
      default:
        sortedArticles.sort((a, b) => {
          const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt as Date
          const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt as Date
          return dateB.getTime() - dateA.getTime()
        })
        break
    }
    
    // Apply pagination
    const total = sortedArticles.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = sortedArticles.slice(startIndex, endIndex)
    
    return NextResponse.json({
      articles: paginatedArticles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    )
  }
}