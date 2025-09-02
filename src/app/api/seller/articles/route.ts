import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
        where.isAvailable = true
      } else if (status === 'sold') {
        where.isAvailable = false
      } else if (status === 'paused') {
        // Pour l'instant, on considère que "paused" = disponible mais pas affiché
        // Cette logique peut être ajustée selon les besoins
        where.isAvailable = true
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
    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
      price: article.price,
      images: JSON.parse(article.images),
      condition: article.condition,
      isAvailable: article.isAvailable,

      views: article.views,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      category: article.category,
      status: article.isAvailable ? 'ACTIVE' : 'SOLD' // Logique simplifiée
    }))
    
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