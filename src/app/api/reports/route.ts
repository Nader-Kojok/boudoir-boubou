import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createReportSchema = z.object({
  type: z.enum(['ARTICLE', 'USER', 'REVIEW']),
  reason: z.enum([
    'INAPPROPRIATE_CONTENT',
    'SPAM',
    'FAKE_PRODUCT',
    'HARASSMENT',
    'FRAUD',
    'COPYRIGHT_VIOLATION',
    'OTHER'
  ]),
  description: z.string().optional(),
  articleId: z.string().optional(),
  userId: z.string().optional(),
  reviewId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createReportSchema.parse(body);

    // Vérifier qu'au moins un ID de contenu est fourni
    if (!validatedData.articleId && !validatedData.userId && !validatedData.reviewId) {
      return NextResponse.json(
        { error: 'Au moins un élément à signaler doit être spécifié' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur ne se signale pas lui-même
    if (validatedData.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous signaler vous-même' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà signalé ce contenu
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        ...(validatedData.articleId && { articleId: validatedData.articleId }),
        ...(validatedData.userId && { userId: validatedData.userId }),
        ...(validatedData.reviewId && { reviewId: validatedData.reviewId }),
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'Vous avez déjà signalé ce contenu' },
        { status: 400 }
      );
    }

    // Créer le signalement
    const report = await prisma.report.create({
      data: {
        type: validatedData.type,
        reason: validatedData.reason,
        description: validatedData.description,
        reporterId: session.user.id,
        articleId: validatedData.articleId,
        userId: validatedData.userId,
        reviewId: validatedData.reviewId,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            phone: true
          },
        },
        article: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        review: {
          select: {
            id: true,
            comment: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Signalement créé avec succès',
      report,
    });
  } catch (error) {
    console.error('Erreur lors de la création du signalement:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Seuls les modérateurs et administrateurs peuvent voir tous les signalements
    if (session.user.role !== 'MODERATOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              phone: true
            },
          },
          moderator: {
            select: {
              id: true,
              name: true,
            },
          },
          article: {
            select: {
              id: true,
              title: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          review: {
            select: {
              id: true,
              comment: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des signalements:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}