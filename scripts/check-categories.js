const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('🔍 Vérification des catégories dans la base de données...');
    
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`📊 Nombre de catégories trouvées: ${categories.length}`);
    console.log('\n📋 Liste des catégories:');
    
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (slug: ${category.slug})`);
      if (category.description) {
        console.log(`   Description: ${category.description}`);
      }
      console.log('');
    });
    
    // Vérifier si "casual" existe
    const casualCategory = categories.find(cat => cat.slug === 'casual');
    if (casualCategory) {
      console.log('✅ La catégorie "casual" existe dans la base de données');
    } else {
      console.log('❌ La catégorie "casual" n\'existe PAS dans la base de données');
      console.log('💡 Il faut l\'ajouter à la base de données');
    }
    
    // Vérifier si "traditionnel" existe encore
    const traditionnelCategory = categories.find(cat => cat.slug === 'traditionnel');
    if (traditionnelCategory) {
      console.log('⚠️  La catégorie "traditionnel" existe encore');
      console.log(`   Nom actuel: ${traditionnelCategory.name}`);
    }
    
    // Vérifier si "tradi-casual" existe
    const tradiCasualCategory = categories.find(cat => cat.slug === 'tradi-casual');
    if (tradiCasualCategory) {
      console.log('✅ La catégorie "tradi-casual" existe dans la base de données');
      console.log(`   Nom actuel: ${tradiCasualCategory.name}`);
    } else {
      console.log('❌ La catégorie "tradi-casual" n\'existe PAS dans la base de données');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();