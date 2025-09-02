import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getArticles, prisma } from '@/lib/db'
import { ArticleCondition, PaymentMethod, PromotionType } from '@prisma/client'
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
  images: z.array(z.string().url('URL d\'image invalide')).min(1, 'Au moins une image est requise'),
  paymentData: z.object({
    method: z.enum(['wave', 'orange_money']),
    amount: z.number().positive(),
    transactionId: z.string().min(1),
    promotions: z.array(z.string()).optional()
  }).optional()
})

// Mapping des catégories du formulaire vers les IDs de la base de données
const categoryMapping: Record<string, string> = {
  'mariage': 'mariage',
  'soiree': 'soiree', 
  'traditionnel': 'traditionnel',
  'tradi-casual': 'tradi-casual',
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
    
    // Validation des URLs d'images (Vercel Blob)
    for (const [index, imageUrl] of validatedData.images.entries()) {
      if (!imageUrl.includes('blob.vercel-storage.com')) {
        return NextResponse.json(
          { 
            error: `Image ${index + 1} invalide: URL non autorisée`,
            details: `Les images doivent être uploadées via notre système de stockage`
          },
          { status: 400 }
        )
      }
    }
    
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
    
    // Créer l'article avec transaction pour gérer le paiement
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'article avec le statut approprié
      const articleStatus = validatedData.paymentData ? 'PENDING_MODERATION' : 'PENDING_PAYMENT'
      
      const article = await tx.article.create({
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
          status: articleStatus,
          isAvailable: false // L'article ne sera disponible qu'après approbation
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

      // Si des données de paiement sont fournies, créer l'enregistrement de paiement
      if (validatedData.paymentData) {
        await tx.payment.create({
          data: {
            amount: validatedData.paymentData.amount,
            method: validatedData.paymentData.method.toUpperCase() as PaymentMethod,
            status: 'COMPLETED',
            transactionId: validatedData.paymentData.transactionId,
            articleId: article.id,
            userId: session.user.id,
            completedAt: new Date()
          }
        })

        // Créer les promotions si spécifiées
        if (validatedData.paymentData.promotions && validatedData.paymentData.promotions.length > 0) {
          const promotionData = validatedData.paymentData.promotions.map(promo => {
            let price = 0
            let duration = 0
            
            switch (promo) {
              case 'FEATURED_HOMEPAGE':
                price = 2000
                duration = 7
                break
              case 'BOOST_SEARCH':
                price = 1500
                duration = 14
                break
              case 'HIGHLIGHT':
                price = 1000
                duration = 7
                break
              case 'EXTENDED_VISIBILITY':
                price = 3000
                duration = 30
                break
            }
            
            return {
              type: promo as PromotionType,
              price,
              duration,
              articleId: article.id,
              isActive: false // Sera activé après approbation
            }
          })
          
          await tx.articlePromotion.createMany({
            data: promotionData
          })
        }
      }

      return article
    })
    
    // Formater la réponse
    const formattedArticle = {
      ...result,
      images: JSON.parse(result.images)
    }
    
    const message = validatedData.paymentData 
      ? 'Article créé avec succès et envoyé en modération'
      : 'Article créé avec succès, paiement requis pour publication'
    
    return NextResponse.json(
      { 
        message,
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