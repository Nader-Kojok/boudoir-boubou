import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const followSchema = z.object({
  action: z.enum(['follow', 'unfollow'])
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id: targetUserId } = await params;
    const currentUserId = session.user.id;

    // Vérifier qu'on ne peut pas se suivre soi-même
    if (targetUserId === currentUserId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous suivre vous-même' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, role: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action } = followSchema.parse(body);

    if (action === 'follow') {
      // Créer la relation de suivi
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId
          }
        }
      });

      if (existingFollow) {
        return NextResponse.json(
          { error: 'Vous suivez déjà cet utilisateur' },
          { status: 400 }
        );
      }

      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      });

      // Créer un élément de feed pour le nouveau follower
      await prisma.feedItem.create({
        data: {
          type: 'PROFILE_UPDATE',
          userId: targetUserId,
          content: `Nouveau follower: ${session.user.name || 'Utilisateur'}`
        }
      });

      return NextResponse.json({
        message: 'Utilisateur suivi avec succès',
        isFollowing: true
      });
    } else {
      // Supprimer la relation de suivi
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId
          }
        }
      });

      if (!existingFollow) {
        return NextResponse.json(
          { error: 'Vous ne suivez pas cet utilisateur' },
          { status: 400 }
        );
      }

      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId
          }
        }
      });

      return NextResponse.json({
        message: 'Utilisateur non suivi avec succès',
        isFollowing: false
      });
    }
  } catch (error) {
    console.error('Erreur lors du suivi/désuivi:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET - Vérifier si l'utilisateur actuel suit l'utilisateur cible
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id: targetUserId } = await params;
    const currentUserId = session.user.id;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      }
    });

    return NextResponse.json({
      isFollowing: !!follow
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du suivi:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}