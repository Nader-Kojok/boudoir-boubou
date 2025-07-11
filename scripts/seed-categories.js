const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Mariage',
    slug: 'mariage',
    description: 'Robes et accessoires de mariage traditionnels sénégalais',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop&crop=center'
  },
  {
    name: 'Traditionnel',
    slug: 'traditionnel', 
    description: 'Vêtements traditionnels sénégalais',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop&crop=center'
  },
  {
    name: 'Soirée',
    slug: 'soiree',
    description: 'Tenues élégantes pour les soirées',
    image: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400&h=300&fit=crop&crop=center'
  },
  {
    name: 'Casual',
    slug: 'casual',
    description: 'Vêtements décontractés du quotidien',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop&crop=center'
  },
  {
    name: 'Accessoires',
    slug: 'accessoires',
    description: 'Bijoux, sacs et accessoires de mode',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop&crop=center'
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