import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateReportSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']),
  moderatorNotes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Seuls les modérateurs et administrateurs peuvent voir les détails d'un signalement
    if (session.user.role !== 'MODERATOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            phone: true,
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
            description: true,
            images: true,
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
          },
        },
        review: {
          select: {
            id: true,
            comment: true,
            rating: true,
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Signalement non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Erreur lors de la récupération du signalement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Seuls les modérateurs et administrateurs peuvent modifier un signalement
    if (session.user.role !== 'MODERATOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateReportSchema.parse(body);

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Signalement non trouvé' },
        { status: 404 }
      );
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: validatedData.status,
        moderatorId: session.user.id,
        resolvedAt: validatedData.status === 'RESOLVED' || validatedData.status === 'DISMISSED' 
          ? new Date() 
          : null,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
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
    });

    return NextResponse.json({
      message: 'Signalement mis à jour avec succès',
      report: updatedReport,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du signalement:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Seuls les administrateurs peuvent supprimer un signalement
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Signalement non trouvé' },
        { status: 404 }
      );
    }

    await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Signalement supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du signalement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}