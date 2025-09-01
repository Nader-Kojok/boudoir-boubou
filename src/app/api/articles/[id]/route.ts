import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createCachedApiResponse, invalidateApiCache, CACHE_TAGS, CACHE_DURATIONS } from '@/lib/api-cache-middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    return createCachedApiResponse({
      article: {
        ...article,
        averageRating
      },
      reviews,
      similarArticles: similarArticlesWithRating
    }, {
      maxAge: CACHE_DURATIONS.MEDIUM,
      tags: [CACHE_TAGS.ARTICLES, `article-${id}`]
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { isAvailable } = body

    // Vérifier que l'article existe et appartient au vendeur
    const article = await prisma.article.findUnique({
      where: { id },
      select: { sellerId: true }
    })

    if (!article) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 }
      )
    }

    if (article.sellerId !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé à modifier cet article' },
        { status: 403 }
      )
    }

    // Mettre à jour le statut de l'article
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { isAvailable },
      select: {
        id: true,
        isAvailable: true
      }
    })

    // Invalider le cache après la mise à jour
    await invalidateApiCache([
      CACHE_TAGS.ARTICLES,
      CACHE_TAGS.ANALYTICS,
      CACHE_TAGS.FEED
    ])

    return createCachedApiResponse({
      message: 'Statut de l\'article mis à jour avec succès',
      article: updatedArticle
    }, {
      noCache: true // Les mutations ne doivent pas être mises en cache
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, category, price, condition, size, brand, color, images } = body

    // Vérifier que l'article existe et appartient au vendeur
    const article = await prisma.article.findUnique({
      where: { id },
      select: { sellerId: true }
    })

    if (!article) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 }
      )
    }

    if (article.sellerId !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé à modifier cet article' },
        { status: 403 }
      )
    }

    // Mapping des catégories (même que dans route.ts)
    const categoryMapping: Record<string, string> = {
      'mariage': 'mariage',
      'soiree': 'soiree', 
      'traditionnel': 'traditionnel',
      'casual': 'casual',
      'accessoires': 'accessoires'
    }

    // Vérifier que la catégorie existe
    const categorySlug = categoryMapping[category]
    if (!categorySlug) {
      return NextResponse.json(
        { error: 'Catégorie invalide' },
        { status: 400 }
      )
    }
    
    const categoryRecord = await prisma.category.findUnique({
      where: { slug: categorySlug }
    })

    if (!categoryRecord) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 400 }
      )
    }

    // Mettre à jour l'article
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
          title,
          description,
          categoryId: categoryRecord.id,
          price: parseFloat(price),
          condition,
          size,
          brand,
          color,
          images: JSON.stringify(images),
          updatedAt: new Date()
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

    // Invalider le cache après la mise à jour
    await invalidateApiCache([
      CACHE_TAGS.ARTICLES,
      CACHE_TAGS.ANALYTICS,
      CACHE_TAGS.FEED,
      `article-${id}`
    ])

    return createCachedApiResponse({
      message: 'Article mis à jour avec succès',
      article: updatedArticle
    }, {
      noCache: true // Les mutations ne doivent pas être mises en cache
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Vérifier que l'article existe et appartient au vendeur
    const article = await prisma.article.findUnique({
      where: { id },
      select: { sellerId: true }
    })

    if (!article) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 }
      )
    }

    if (article.sellerId !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé à supprimer cet article' },
        { status: 403 }
      )
    }



    // Supprimer d'abord les favoris liés à cet article
    await prisma.favorite.deleteMany({
      where: { articleId: id }
    })

    // Supprimer les avis liés à cet article
    await prisma.review.deleteMany({
      where: { articleId: id }
    })

    // Supprimer l'article
    await prisma.article.delete({
      where: { id }
    })

    // Invalider le cache après la suppression
    await invalidateApiCache([
      CACHE_TAGS.ARTICLES,
      CACHE_TAGS.ANALYTICS,
      CACHE_TAGS.FEED,
      `article-${id}`
    ])

    return createCachedApiResponse(
      { message: 'Article supprimé avec succès' },
      { 
        noCache: true // Les mutations ne doivent pas être mises en cache
      }
    )

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}