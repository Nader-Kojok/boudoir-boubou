import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
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
    const body = await request.json()
    const { status } = body

    // Valider le statut (pour l'instant on gère juste SOLD)
    if (status !== 'SOLD') {
      return NextResponse.json(
        { error: 'Statut non supporté' },
        { status: 400 }
      )
    }

    // Vérifier que l'article appartient au vendeur
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
        sellerId: session.user.id
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le statut
    const updatedArticle = await prisma.article.update({
      where: {
        id: articleId
      },
      data: {
        isAvailable: false // Marquer comme non disponible quand vendu
      }
    })

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      message: `Article ${status === 'SOLD' ? 'marqué comme vendu' : 'mis à jour'} avec succès`
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}