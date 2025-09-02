const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Mariage',
    slug: 'mariage',
    description: 'Robes et accessoires de mariage traditionnels Sénégalais',
    image: '/categories/mariage.webp'
  },
  {
    name: 'Traditionnel',
    slug: 'traditionnel', 
    description: 'Vêtements traditionnels Sénégalais',
    image: '/categories/tradi.webp'
  },
  {
    name: 'Soirée',
    slug: 'soiree',
    description: 'Tenues élégantes pour les soirées',
    image: '/categories/soiree.webp'
  },
  {
    name: 'Tradi-casual',
    slug: 'tradi-casual',
    description: 'Vêtements décontractés du quotidien',
    image: '/categories/tradi-casual.webp'
  },
  {
    name: 'Accessoires',
    slug: 'accessoires',
    description: 'Bijoux, sacs et accessoires de mode',
    image: '/categories/accessoire.webp'
  }
];

async function seedCategories() {
  try {
    console.log('🌱 Début du seeding des catégories...');
    
    // Vérifier les catégories existantes
    const existingCategories = await prisma.category.findMany();
    console.log(`📊 Catégories existantes: ${existingCategories.length}`);
    
    if (existingCategories.length === 0) {
      // Créer les catégories
      for (const category of categories) {
        await prisma.category.create({
          data: category
        });
        console.log(`✅ Catégorie créée: ${category.name}`);
      }
    } else {
      // Mettre à jour les images des catégories existantes
      console.log('🔄 Mise à jour des images des catégories existantes...');
      for (const category of categories) {
        const existing = existingCategories.find(cat => cat.slug === category.slug);
        if (existing) {
          await prisma.category.update({
            where: { id: existing.id },
            data: { image: category.image }
          });
          console.log(`🖼️ Image mise à jour pour: ${category.name}`);
        } else {
          await prisma.category.create({
            data: category
          });
          console.log(`✅ Catégorie créée: ${category.name}`);
        }
      }
    }
    
    console.log('🎉 Seeding terminé!');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();