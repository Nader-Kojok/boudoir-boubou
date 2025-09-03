const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteTraditionnelCategory() {
  try {
    console.log('🗑️  Suppression de la catégorie "Traditionnel"...');
    
    // 1. Vérifier si la catégorie existe
    const traditionnelCategory = await prisma.category.findUnique({
      where: { slug: 'traditionnel' },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });
    
    if (!traditionnelCategory) {
      console.log('⚠️  La catégorie "Traditionnel" n\'existe pas.');
      return;
    }
    
    console.log(`📊 Catégorie trouvée: ${traditionnelCategory.name}`);
    console.log(`📦 Nombre d'articles associés: ${traditionnelCategory._count.articles}`);
    
    // 2. Vérifier s'il y a des articles associés
    if (traditionnelCategory._count.articles > 0) {
      console.log('❌ Impossible de supprimer la catégorie car elle contient des articles.');
      console.log('💡 Vous devez d\'abord déplacer ou supprimer les articles associés.');
      
      // Afficher les articles associés
      const articles = await prisma.article.findMany({
        where: { categoryId: traditionnelCategory.id },
        select: {
          id: true,
          title: true,
          seller: {
            select: {
              name: true
            }
          }
        }
      });
      
      console.log('\n📋 Articles associés à cette catégorie:');
      articles.forEach((article, index) => {
        console.log(`${index + 1}. "${article.title}" par ${article.seller.name}`);
      });
      
      return;
    }
    
    // 3. Supprimer la catégorie si aucun article n'est associé
    await prisma.category.delete({
      where: { slug: 'traditionnel' }
    });
    
    console.log('✅ Catégorie "Traditionnel" supprimée avec succès!');
    
    // 4. Afficher les catégories restantes
    console.log('\n📋 Catégories restantes:');
    const remainingCategories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    remainingCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (slug: ${category.slug})`);
    });
    
    console.log('\n🎉 Suppression terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTraditionnelCategory();