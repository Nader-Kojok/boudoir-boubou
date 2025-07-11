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
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const { id: articleId } = await params

    // Vérifier que l'article existe
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'article est déjà en favori
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId: articleId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Article déjà en favori' },
        { status: 400 }
      )
    }

    // Ajouter aux favoris
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        articleId: articleId
      }
    })

    return NextResponse.json(
      { message: 'Article ajouté aux favoris', favorite },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error)
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
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const { id: articleId } = await params

    // Vérifier que l'article existe
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'article est en favori
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId: articleId
        }
      }
    })

    if (!existingFavorite) {
      return NextResponse.json(
        { error: 'Article non trouvé dans les favoris' },
        { status: 404 }
      )
    }

    // Supprimer des favoris
    await prisma.favorite.delete({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId: articleId
        }
      }
    })

    return NextResponse.json(
      { message: 'Article retiré des favoris' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erreur lors de la suppression des favoris:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { isFavorite: false },
        { status: 200 }
      )
    }

    const { id: articleId } = await params

    // Vérifier si l'article est en favori
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId: articleId
        }
      }
    })

    return NextResponse.json(
      { isFavorite: !!favorite },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erreur lors de la vérification des favoris:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}