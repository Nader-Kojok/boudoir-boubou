const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCategories() {
  try {
    console.log('🔧 Correction des catégories...');
    
    // 1. Renommer "Traditionnel" en "Tradi-casual"
    const traditionnelCategory = await prisma.category.findUnique({
      where: { slug: 'traditionnel' }
    });
    
    if (traditionnelCategory) {
      console.log('🔄 Mise à jour de la catégorie "Traditionnel" vers "Tradi-casual"...');
      
      await prisma.category.update({
        where: { slug: 'traditionnel' },
        data: {
          name: 'Tradi-casual',
          slug: 'tradi-casual',
          description: 'Vêtements traditionnels décontractés pour le quotidien',
          image: '/categories/tradi-casual.webp'
        }
      });
      
      console.log('✅ Catégorie "Traditionnel" renommée en "Tradi-casual"');
    } else {
      console.log('⚠️  Catégorie "Traditionnel" non trouvée');
    }
    
    // 2. Créer une nouvelle catégorie "Traditionnel" si nécessaire
    const existingTradi = await prisma.category.findUnique({
      where: { slug: 'tradi-casual' }
    });
    
    if (existingTradi) {
      console.log('✅ Catégorie "Tradi-casual" existe maintenant');
      
      // Créer une nouvelle catégorie "Traditionnel" pour remplacer l'ancienne
      const newTraditionnelExists = await prisma.category.findUnique({
        where: { slug: 'traditionnel' }
      });
      
      if (!newTraditionnelExists) {
        await prisma.category.create({
          data: {
            name: 'Traditionnel',
            slug: 'traditionnel',
            description: 'Vêtements traditionnels sénégalais authentiques',
            image: '/categories/tradi.webp'
          }
        });
        console.log('✅ Nouvelle catégorie "Traditionnel" créée');
      }
    }
    
    // 3. Vérifier le résultat final
    console.log('\n📋 Catégories après correction:');
    const finalCategories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    finalCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (slug: ${category.slug})`);
    });
    
    console.log('\n🎉 Correction terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategories();