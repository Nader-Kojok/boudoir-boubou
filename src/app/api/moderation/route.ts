import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Schéma de validation pour les actions de modération
  const moderationSchema = z.object({
  articleId: z.string().min(1, 'ID de l&apos;article requis'),
  action: z.enum(['APPROVE', 'REJECT'], {
    required_error: 'Action requise'
  }),
  notes: z.string().optional(),
  rejectionReason: z.string().optional()
})

// GET - Récupérer les articles en attente de modération
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est un modérateur/admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer les articles en attente de modération
    const articles = await prisma.article.findMany({
      where: {
        status: 'PENDING_MODERATION'
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            transactionId: true,
            completedAt: true
          }
        },
        promotions: {
          select: {
            id: true,
            type: true,
            price: true,
            duration: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Plus anciens en premier
      }
    })

    // Formater les articles
    const formattedArticles = articles.map(article => ({
      ...article,
      images: JSON.parse(article.images)
    }))

    return NextResponse.json({
      articles: formattedArticles,
      total: formattedArticles.length
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des articles en modération:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    )
  }
}

// POST - Approuver ou rejeter un article
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est un modérateur/admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = moderationSchema.parse(body)

    // Vérifier que l'article existe et est en attente de modération
    const article = await prisma.article.findUnique({
      where: { id: validatedData.articleId },
      include: {
        promotions: true
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    if (article.status !== 'PENDING_MODERATION') {
      return NextResponse.json(
        { error: 'Cet article n&apos;est pas en attente de modération' },
        { status: 400 }
      )
    }

    // Effectuer l'action de modération dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      let newStatus: 'APPROVED' | 'REJECTED'
      let isAvailable = false
      let publishedAt: Date | null = null

      if (validatedData.action === 'APPROVE') {
        newStatus = 'APPROVED'
        isAvailable = true
        publishedAt = new Date()

        // Activer les promotions si l'article est approuvé
        if (article.promotions.length > 0) {
          const now = new Date()
          await tx.articlePromotion.updateMany({
            where: {
              articleId: article.id
            },
            data: {
              isActive: true,
              startDate: now,
              endDate: new Date(now.getTime() + (article.promotions[0].duration * 24 * 60 * 60 * 1000))
            }
          })
        }
      } else {
        newStatus = 'REJECTED'
      }

      // Mettre à jour l'article
      const updatedArticle = await tx.article.update({
        where: { id: validatedData.articleId },
        data: {
          status: newStatus,
          isAvailable,
          publishedAt,
          moderationNotes: validatedData.notes,
          rejectionReason: validatedData.action === 'REJECT' ? validatedData.rejectionReason : null
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        }
      })

      // Créer un log de modération
      await tx.moderationLog.create({
        data: {
          articleId: validatedData.articleId,
          moderatorId: session.user.id,
          action: validatedData.action,
          notes: validatedData.notes
        }
      })

      return updatedArticle
    })

    const message = validatedData.action === 'APPROVE' 
      ? 'Article approuvé et publié avec succès'
      : 'Article rejeté'

    return NextResponse.json({
      message,
      article: {
        ...result,
        images: JSON.parse(result.images)
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la modération:', error)
    
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
      { error: 'Erreur lors de la modération' },
      { status: 500 }
    )
  }
}