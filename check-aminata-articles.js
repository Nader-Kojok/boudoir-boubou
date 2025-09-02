const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAminataArticles() {
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

    if (user) {
      console.log('Utilisatrice trouvée:', user.name, '- ID:', user.id);
      
      // Récupérer tous ses articles
      const articles = await prisma.article.findMany({
        where: {
          sellerId: user.id
        },
        select: {
          id: true,
          title: true,
          status: true,
          isAvailable: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log('\n=== ARTICLES D\'AMINATA DIALLO ===');
      console.log('Total articles:', articles.length);
      
      articles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`   ID: ${article.id}`);
        console.log(`   Statut: ${article.status}`);
        console.log(`   Disponible: ${article.isAvailable}`);
        console.log(`   Créé le: ${article.createdAt}`);
      });
      
      // Compter par statut
      const statusCount = {};
      articles.forEach(article => {
        statusCount[article.status] = (statusCount[article.status] || 0) + 1;
      });
      
      console.log('\n=== RÉPARTITION PAR STATUT ===');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`${status}: ${count} article(s)`);
      });
      
      // Articles visibles publiquement (APPROVED + isAvailable)
      const publicArticles = articles.filter(a => a.status === 'APPROVED' && a.isAvailable);
      console.log(`\nArticles visibles publiquement: ${publicArticles.length}`);
      
    } else {
      console.log('Aucune utilisatrice trouvée avec le nom Aminata');
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAminataArticles();