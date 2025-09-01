import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Obtenir des suggestions de vendeurs à suivre
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const currentUserId = session.user.id;

    // Obtenir les IDs des vendeurs déjà suivis
    const followedSellers = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true }
    });

    const followedSellerIds = followedSellers.map(f => f.followingId);
    followedSellerIds.push(currentUserId); // Exclure l'utilisateur actuel

    // Récupérer des vendeurs non suivis
    const suggestedSellers = await prisma.user.findMany({
      where: {
        role: 'SELLER',
        id: {
          notIn: followedSellerIds
        },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        location: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Récupérer les statistiques pour chaque vendeur
    const formattedSellers = await Promise.all(
      suggestedSellers.map(async (seller) => {
        const [articlesCount, followersCount] = await Promise.all([
          prisma.article.count({
            where: {
              sellerId: seller.id,
              status: 'PUBLISHED'
            }
          }),
          prisma.follow.count({
            where: {
              followingId: seller.id
            }
          })
        ]);

        return {
          id: seller.id,
          name: seller.name,
          image: seller.image,
          bio: seller.bio,
          location: seller.location,
          stats: {
            articlesCount,
            followersCount,
            averageRating: 4.5 // Valeur par défaut pour l'instant
          },
          memberSince: seller.createdAt
        };
      })
    );

    return NextResponse.json({
      sellers: formattedSellers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des suggestions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}