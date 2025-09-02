const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFeedItem() {
  try {
    // Chercher Aminata Diallo
    const user = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Aminata',
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      console.log('Utilisatrice Aminata non trouvée');
      return;
    }

    console.log('Utilisatrice trouvée:', user.name, '- ID:', user.id);

    // Chercher son article APPROVED
    const article = await prisma.article.findFirst({
      where: {
        sellerId: user.id,
        status: 'APPROVED'
      }
    });

    if (!article) {
      console.log('Aucun article APPROVED trouvé');
      return;
    }

    console.log('Article trouvé:', article.title, '- ID:', article.id);

    // Vérifier s'il existe déjà un FeedItem
    const existingFeedItem = await prisma.feedItem.findFirst({
      where: {
        userId: user.id,
        articleId: article.id,
        type: 'NEW_ARTICLE'
      }
    });

    if (existingFeedItem) {
      console.log('FeedItem existe déjà:', existingFeedItem.id);
      console.log('Créé le:', existingFeedItem.createdAt);
    } else {
      console.log('Aucun FeedItem trouvé pour cet article');
      
      // Créer le FeedItem
      const feedItem = await prisma.feedItem.create({
        data: {
          type: 'NEW_ARTICLE',
          userId: user.id,
          articleId: article.id
        }
      });
      
      console.log('FeedItem créé:', feedItem.id);
      console.log('Type:', feedItem.type);
      console.log('Créé le:', feedItem.createdAt);
    }

    // Vérifier les followers d'Aminata
    const followers = await prisma.follow.findMany({
      where: {
        followingId: user.id
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('\n=== FOLLOWERS D\'AMINATA ===');
    console.log('Nombre de followers:', followers.length);
    followers.forEach((follow, index) => {
      console.log(`${index + 1}. ${follow.follower.name} (ID: ${follow.follower.id})`);
    });

    // Vérifier les notifications
    const notifications = await prisma.notification.findMany({
      where: {
        actorId: user.id,
        entityId: article.id,
        type: 'NEW_ARTICLE_FROM_FOLLOWED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('\n=== NOTIFICATIONS CRÉÉES ===');
    console.log('Nombre de notifications:', notifications.length);
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. Pour ${notif.user.name}: ${notif.message}`);
    });

    // Si pas de notifications et qu'il y a des followers, créer les notifications
    if (notifications.length === 0 && followers.length > 0) {
      console.log('\n=== CRÉATION DES NOTIFICATIONS MANQUANTES ===');
      for (const follow of followers) {
        const notification = await prisma.notification.create({
          data: {
            type: 'NEW_ARTICLE_FROM_FOLLOWED',
            title: 'Nouvel article',
            message: `${user.name} a publié un nouvel article: ${article.title}`,
            userId: follow.follower.id,
            actorId: user.id,
            entityId: article.id,
            entityType: 'article'
          }
        });
        console.log(`Notification créée pour ${follow.follower.name}: ${notification.id}`);
      }
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFeedItem();