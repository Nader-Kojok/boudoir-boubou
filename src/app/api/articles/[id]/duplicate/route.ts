import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id: articleId } = await params
    
    // Récupérer l'article original
    const originalArticle = await prisma.article.findUnique({
      where: {
        id: articleId,
        sellerId: session.user.id
      },
      include: {
        category: true
      }
    })

    if (!originalArticle) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Créer une copie de l'article
    const duplicatedArticle = await prisma.article.create({
      data: {
        title: `${originalArticle.title} (Copie)`,
        description: originalArticle.description,
        price: originalArticle.price,
        size: originalArticle.size,
        condition: originalArticle.condition,
        brand: originalArticle.brand,
        color: originalArticle.color,
        categoryId: originalArticle.categoryId,
        sellerId: session.user.id,
        isAvailable: false, // Pas disponible par défaut
        images: originalArticle.images // Copier les images JSON
      }
    })

    return NextResponse.json({
      success: true,
      newArticleId: duplicatedArticle.id,
      message: 'Article dupliqué avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la duplication:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}