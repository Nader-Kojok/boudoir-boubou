import { prisma } from '@/lib/db';

export type FeedItemType = 'NEW_ARTICLE' | 'ARTICLE_SOLD' | 'PROFILE_UPDATE' | 'ACHIEVEMENT';

export interface CreateFeedItemData {
  type: FeedItemType;
  userId: string;
  articleId?: string;
  content?: string;
}

/**
 * Crée un nouvel élément de feed
 */
export async function createFeedItem(data: CreateFeedItemData) {
  try {
    return await prisma.feedItem.create({
      data: {
        type: data.type,
        userId: data.userId,
        articleId: data.articleId,
        content: data.content
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'élément de feed:', error);
    throw error;
  }
}

/**
 * Crée un élément de feed pour un nouvel article
 */
export async function createNewArticleFeedItem(userId: string, articleId: string) {
  return createFeedItem({
    type: 'NEW_ARTICLE',
    userId,
    articleId
  });
}

/**
 * Crée un élément de feed pour un article vendu
 */
export async function createArticleSoldFeedItem(userId: string, articleId: string) {
  return createFeedItem({
    type: 'ARTICLE_SOLD',
    userId,
    articleId
  });
}

/**
 * Crée un élément de feed pour une mise à jour de profil
 */
export async function createProfileUpdateFeedItem(userId: string, content?: string) {
  return createFeedItem({
    type: 'PROFILE_UPDATE',
    userId,
    content
  });
}

/**
 * Crée un élément de feed pour un achievement
 */
export async function createAchievementFeedItem(userId: string, content: string) {
  return createFeedItem({
    type: 'ACHIEVEMENT',
    userId,
    content
  });
}

/**
 * Nettoie les anciens éléments de feed (plus de 30 jours)
 */
export async function cleanupOldFeedItems() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const result = await prisma.feedItem.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`Supprimé ${result.count} anciens éléments de feed`);
    return result;
  } catch (error) {
    console.error('Erreur lors du nettoyage des anciens éléments de feed:', error);
    throw error;
  }
}