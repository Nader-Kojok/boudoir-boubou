import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Obtenir la liste des utilisateurs (avec filtres)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const role = searchParams.get('role'); // SELLER, BUYER, etc.
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    // Construire les conditions de filtrage
    const whereConditions: any = {};

    if (role) {
      whereConditions.role = role;
    }

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Obtenir les utilisateurs avec pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          location: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              articles: {
                where: {
                  status: 'PUBLISHED'
                }
              },
              followers: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.user.count({
        where: whereConditions
      })
    ]);

    // Calculer les statistiques pour chaque utilisateur
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        let averageRating = 0;
        let isFollowing = false;
        
        // Vérifier si l'utilisateur connecté suit ce vendeur
        if (currentUserId && currentUserId !== user.id) {
          const followRelation = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: user.id
              }
            }
          });
          isFollowing = !!followRelation;
        }

        // Calculer la note moyenne si c'est un vendeur
        if (user.role === 'SELLER') {
          const reviews = await prisma.review.findMany({
            where: { 
              article: {
                sellerId: user.id
              }
            },
            select: { rating: true }
          });

          if (reviews.length > 0) {
            averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
          }
        }

        const { _count, ...userWithoutCount } = user;
        return {
          ...userWithoutCount,
          stats: {
            articlesCount: _count.articles,
            followersCount: _count.followers,
            averageRating: Math.round(averageRating * 10) / 10
          },
          isFollowing,
          memberSince: user.createdAt.toISOString()
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}