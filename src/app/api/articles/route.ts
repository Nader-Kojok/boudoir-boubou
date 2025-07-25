import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getArticles, prisma } from '@/lib/db'
import { ArticleCondition } from '@prisma/client'
import { z } from 'zod'

// Schéma de validation pour la création d'articles
const createArticleSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  price: z.string().min(1, 'Le prix est requis'),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR'], {
    required_error: 'L\'état de l\'article est requis'
  }),
  size: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  images: z.array(z.string()).min(1, 'Au moins une image est requise')
})

// Mapping des catégories du formulaire vers les IDs de la base de données
const categoryMapping: Record<string, string> = {
  'mariage': 'mariage',
  'soiree': 'soiree', 
  'traditionnel': 'traditionnel',
  'casual': 'casual',
  'accessoires': 'accessoires'
}

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validation des données
    const validatedData = createArticleSchema.parse(body)
    
    // Vérifier que la catégorie existe
    const categorySlug = categoryMapping[validatedData.category]
    if (!categorySlug) {
      return NextResponse.json(
        { error: 'Catégorie invalide' },
        { status: 400 }
      )
    }
    
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 400 }
      )
    }
    
    // Créer l'article
    const article = await prisma.article.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        price: parseFloat(validatedData.price),
        images: JSON.stringify(validatedData.images),
        size: validatedData.size || null,
        brand: validatedData.brand || null,
        color: validatedData.color || null,
        condition: validatedData.condition,
        sellerId: session.user.id,
        categoryId: category.id,
        isAvailable: true
      },
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
            image: true
          }
        }
      }
    })
    
    // Formater la réponse
    const formattedArticle = {
      ...article,
      images: JSON.parse(article.images)
    }
    
    return NextResponse.json(
      { 
        message: 'Article créé avec succès',
        article: formattedArticle
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    )
  }
}