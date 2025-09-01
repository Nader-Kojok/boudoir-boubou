import { prisma } from '@/lib/db';

export type NotificationType = 'NEW_FOLLOWER' | 'NEW_ARTICLE_FROM_FOLLOWED' | 'ARTICLE_SOLD' | 'ARTICLE_LIKED' | 'SYSTEM';

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  actorId?: string;
  entityId?: string;
  entityType?: string;
}

/**
 * Crée une nouvelle notification
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    return await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        actorId: data.actorId,
        entityId: data.entityId,
        entityType: data.entityType
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    throw error;
  }
}

/**
 * Crée une notification pour un nouveau follower
 */
export async function createNewFollowerNotification(followedUserId: string, followerId: string, followerName: string) {
  return createNotification({
    type: 'NEW_FOLLOWER',
    title: 'Nouveau follower',
    message: `${followerName} a commencé à vous suivre`,
    userId: followedUserId,
    actorId: followerId,
    entityType: 'user'
  });
}

/**
 * Crée des notifications pour les followers quand un nouvel article est publié
 */
export async function createNewArticleNotifications(sellerId: string, articleId: string, articleTitle: string) {
  try {
    // Récupérer tous les followers du vendeur
    const followers = await prisma.follow.findMany({
      where: { followingId: sellerId },
      select: { followerId: true }
    });

    if (followers.length === 0) {
      return [];
    }

    // Récupérer le nom du vendeur
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { name: true }
    });

    const sellerName = seller?.name || 'Un vendeur';

    // Créer les notifications en batch
    const notifications = await Promise.all(
      followers.map(follower => 
        createNotification({
          type: 'NEW_ARTICLE_FROM_FOLLOWED',
          title: 'Nouvel article',
          message: `${sellerName} a publié un nouvel article: ${articleTitle}`,
          userId: follower.followerId,
          actorId: sellerId,
          entityId: articleId,
          entityType: 'article'
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Erreur lors de la création des notifications d\'article:', error);
    throw error;
  }
}

/**
 * Crée une notification quand un article est vendu
 */
export async function createArticleSoldNotification(sellerId: string, articleId: string, articleTitle: string) {
  return createNotification({
    type: 'ARTICLE_SOLD',
    title: 'Article vendu',
    message: `Votre article "${articleTitle}" a été vendu !`,
    userId: sellerId,
    entityId: articleId,
    entityType: 'article'
  });
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    return await prisma.notification.update({
      where: {
        id: notificationId,
        userId: userId // S'assurer que l'utilisateur peut seulement marquer ses propres notifications
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur lors du marquage de la notification comme lue:', error);
    throw error;
  }
}

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    return await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    throw error;
  }
}

/**
 * Récupère les notifications d'un utilisateur
 */
export async function getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
  try {
    const offset = (page - 1) * limit;

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.notification.count({
        where: { userId }
      })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
}

/**
 * Compte les notifications non lues d'un utilisateur
 */
export async function getUnreadNotificationsCount(userId: string) {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  } catch (error) {
    console.error('Erreur lors du comptage des notifications non lues:', error);
    throw error;
  }
}

/**
 * Nettoie les anciennes notifications (plus de 30 jours)
 */
export async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        isRead: true // Ne supprimer que les notifications lues
      }
    });

    console.log(`Supprimé ${result.count} anciennes notifications`);
    return result;
  } catch (error) {
    console.error('Erreur lors du nettoyage des anciennes notifications:', error);
    throw error;
  }
}