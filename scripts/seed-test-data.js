const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🌱 Début du seeding des données de test...');
    
    // Créer des utilisateurs de test
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Créer un vendeur
    const seller = await prisma.user.upsert({
      where: { phone: '+221701234567' },
      update: {},
      create: {
        name: 'Aminata Diallo',
        phone: '+221701234567',
        password: hashedPassword,
        role: 'SELLER',
        bio: 'Créatrice de mode spécialisée dans les vêtements traditionnels sénégalais',
        location: 'Dakar, Sénégal',
        whatsappNumber: '+221701234567',
        phoneVerified: new Date()
      }
    });
    
    // Créer un acheteur
    const buyer = await prisma.user.upsert({
      where: { phone: '+221709876543' },
      update: {},
      create: {
        name: 'Fatou Sall',
        phone: '+221709876543',
        password: hashedPassword,
        role: 'BUYER',
        bio: 'Passionnée de mode africaine',
        location: 'Thiès, Sénégal',
        whatsappNumber: '+221709876543',
        phoneVerified: new Date()
      }
    });
    
    console.log('👥 Utilisateurs créés:', { seller: seller.name, buyer: buyer.name });
    
    // Récupérer les catégories
    const categories = await prisma.category.findMany();
    
    if (categories.length === 0) {
      console.log('❌ Aucune catégorie trouvée. Exécutez d\'abord seed-categories.js');
      return;
    }
    
    // Créer des articles
    const articles = [
      {
        title: 'Robe Wax Élégante',
        description: 'Magnifique robe en tissu wax avec motifs traditionnels. Parfaite pour les occasions spéciales.',
        price: 85000,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=600&fit=crop'
        ]),
        size: 'M',
        condition: 'EXCELLENT',
        sellerId: seller.id,
        categoryId: categories.find(c => c.slug === 'traditionnel')?.id || categories[0].id
      },
      {
        title: 'Ensemble Traditionnel Complet',
        description: 'Ensemble complet avec boubou et pantalon assorti. Tissu de haute qualité.',
        price: 120000,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=600&fit=crop'
        ]),
        size: 'L',
        condition: 'GOOD',
        sellerId: seller.id,
        categoryId: categories.find(c => c.slug === 'traditionnel')?.id || categories[0].id
      },
      {
        title: 'Robe de Soirée Moderne',
        description: 'Robe de soirée moderne avec touches africaines. Idéale pour les événements.',
        price: 95000,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=600&fit=crop'
        ]),
        size: 'S',
        condition: 'EXCELLENT',
        sellerId: seller.id,
        categoryId: categories.find(c => c.slug === 'soiree')?.id || categories[0].id
      },
      {
        title: 'Headwrap Coloré',
        description: 'Headwrap en tissu wax aux couleurs vives. Accessoire indispensable.',
        price: 25000,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop'
        ]),
        condition: 'EXCELLENT',
        sellerId: seller.id,
        categoryId: categories.find(c => c.slug === 'accessoires')?.id || categories[0].id
      },
      {
        title: 'Boubou Brodé Premium',
        description: 'Boubou avec broderies artisanales. Pièce unique réalisée par des artisans locaux.',
        price: 150000,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=600&fit=crop'
        ]),
        size: 'XL',
        condition: 'EXCELLENT',
        sellerId: seller.id,
        categoryId: categories.find(c => c.slug === 'traditionnel')?.id || categories[0].id
      }
    ];
    
    const createdArticles = [];
    for (const articleData of articles) {
      const article = await prisma.article.create({
        data: articleData
      });
      createdArticles.push(article);
    }
    
    console.log('📦 Articles créés:', createdArticles.length);
    
    // Créer des favoris
    for (let i = 0; i < 3; i++) {
      await prisma.favorite.create({
        data: {
          userId: buyer.id,
          articleId: createdArticles[i].id
        }
      });
    }
    
    console.log('❤️ Favoris créés');
    
    // Créer des avis
    await prisma.review.create({
      data: {
        reviewerId: buyer.id,
        articleId: createdArticles[0].id,
        rating: 5,
        comment: 'Magnifique robe, exactement comme sur les photos. Très satisfaite de mon achat !'
      }
    });
    
    console.log('⭐ Avis créés');
    
    console.log('🎉 Seeding des données de test terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();