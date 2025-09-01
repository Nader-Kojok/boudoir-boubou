import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Obtenir le flux d'actualités pour l'utilisateur connecté
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // Filtrer par type si spécifié
    const offset = (page - 1) * limit;

    const userId = session.user.id;

    // Obtenir les IDs des utilisateurs suivis
    const followedUsers = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });

    const followedUserIds = followedUsers.map(f => f.followingId);

    if (followedUserIds.length === 0) {
      return NextResponse.json({
        feedItems: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      });
    }

    // Construire les conditions de filtrage
    const whereConditions = {
      userId: { in: followedUserIds }
    } as Record<string, unknown>;

    if (type) {
      whereConditions.type = type;
    }

    // Obtenir les éléments du feed avec pagination
    const [feedItems, totalCount] = await Promise.all([
      prisma.feedItem.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true
            }
          },
          article: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              images: true,
              condition: true,
              category: {
                select: {
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.feedItem.count({
        where: whereConditions
      })
    ]);

    // Formater les données du feed
    const formattedFeedItems = feedItems.map(item => {
      const formattedItem: Record<string, unknown> = {
        id: item.id,
        type: item.type,
        content: item.content,
        createdAt: item.createdAt,
        user: item.user
      };

      if (item.article) {
        formattedItem.article = {
          ...item.article,
          images: item.article.images ? JSON.parse(item.article.images) : []
        };
      }

      // Ajouter des messages contextuels selon le type
      switch (item.type) {
        case 'NEW_ARTICLE':
          formattedItem.message = `${item.user.name} a publié un nouvel article`;
          break;
        case 'ARTICLE_SOLD':
          formattedItem.message = `${item.user.name} a vendu un article`;
          break;
        case 'PROFILE_UPDATE':
          formattedItem.message = item.content || `${item.user.name} a mis à jour son profil`;
          break;
        case 'ACHIEVEMENT':
          formattedItem.message = item.content || `${item.user.name} a atteint un nouveau palier`;
          break;
        default:
          formattedItem.message = item.content || 'Nouvelle activité';
      }

      return formattedItem;
    });

    return NextResponse.json({
      feedItems: formattedFeedItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du feed:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}