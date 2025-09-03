import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Fonction pour mapper le statut de la base de données vers le statut d'affichage
function getDisplayStatus(dbStatus: string, isAvailable: boolean): string {
  if (dbStatus === 'PENDING_MODERATION') {
    return 'PENDING_MODERATION'
  }
  if (dbStatus === 'REJECTED') {
    return 'REJECTED'
  }
  if (dbStatus === 'APPROVED') {
    if (isAvailable) {
      return 'ACTIVE'
    } else {
      return 'PAUSED'
    }
  }
  // Pour les anciens articles ou cas particuliers
  return isAvailable ? 'ACTIVE' : 'SOLD'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Utiliser la session pour l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    // Vérifier que l'utilisateur est un vendeur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (user?.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }
    
    const sellerId = session.user.id
    
    // Paramètres de filtrage et pagination
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const categoryId = searchParams.get('categoryId') || 'all'
    const sortBy = searchParams.get('sortBy') || 'recent'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    // Construction des filtres
    const where: {
      sellerId: string;
      categoryId?: string;
      isAvailable?: boolean;
      status?: 'PENDING_PAYMENT' | 'PENDING_MODERATION' | 'APPROVED' | 'REJECTED';
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {
      sellerId
    }
    
    // Filtre de recherche
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Filtre de statut
    if (status !== 'all') {
      if (status === 'active') {
        where.status = 'APPROVED'
        where.isAvailable = true
      } else if (status === 'sold') {
        where.isAvailable = false
      } else if (status === 'paused') {
        where.status = 'APPROVED'
        where.isAvailable = false
      } else if (status === 'pending_moderation') {
        where.status = 'PENDING_MODERATION'
      } else if (status === 'approved') {
        where.status = 'APPROVED'
      } else if (status === 'rejected') {
        where.status = 'REJECTED'
      }
    }
    
    // Filtre de catégorie
    if (categoryId !== 'all') {
      where.categoryId = categoryId
    }
    
    // Construction de l'ordre de tri
    let orderBy: {
      createdAt?: 'desc' | 'asc';
      price?: 'desc' | 'asc';
  
    } = { createdAt: 'desc' } // Par défaut: plus récent

    switch (sortBy) {
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'price-low':
        orderBy = { price: 'asc' }
        break

      case 'recent':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }
    
    // Récupération des articles avec pagination
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
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
        orderBy,
        skip,
        take: limit
      }),
      prisma.article.count({ where })
    ])
    
    // Formatage des données
    const formattedArticles = articles.map(article => {
      let images = []
      try {
        images = article.images ? JSON.parse(article.images) : []
      } catch (error) {
        console.error('Erreur lors du parsing des images pour l\'article', article.id, error)
        images = []
      }
      
      return {
        id: article.id,
        title: article.title,
        description: article.description,
        price: article.price,
        images,
        condition: article.condition,
        isAvailable: article.isAvailable,
        views: article.views,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
        category: article.category,
        status: getDisplayStatus(article.status, article.isAvailable), // Mapper le statut pour l'affichage
        favoritesCount: article._count.favorites,
        reviewsCount: article._count.reviews
      }
    })
    
    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}