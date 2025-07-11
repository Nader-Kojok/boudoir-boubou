const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const path = require('path');

// SQLite database connection
const sqliteDb = new Database(path.join(__dirname, '../prisma/dev.db'));

// PostgreSQL database connection
const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from SQLite to PostgreSQL...');
    
    // Migrate Categories
    console.log('📂 Migrating categories...');
    const categories = sqliteDb.prepare('SELECT * FROM Category').all();
    
    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt)
        },
        create: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt)
        }
      });
      console.log(`✅ Category migrated: ${category.name}`);
    }
    
    // Migrate Users
    console.log('👥 Migrating users...');
    const users = sqliteDb.prepare('SELECT * FROM User').all();
    
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          name: user.name,
          phone: user.phone,
          phoneVerified: user.phoneVerified ? new Date(user.phoneVerified) : null,
          image: user.image,
          password: user.password,
          role: user.role,
          bio: user.bio,
          location: user.location,
          whatsappNumber: user.whatsappNumber,
          resetToken: user.resetToken,
          resetTokenExpiry: user.resetTokenExpiry ? new Date(user.resetTokenExpiry) : null,
          phoneVerificationToken: user.phoneVerificationToken,
          phoneVerificationExpiry: user.phoneVerificationExpiry ? new Date(user.phoneVerificationExpiry) : null,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        },
        create: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          phoneVerified: user.phoneVerified ? new Date(user.phoneVerified) : null,
          image: user.image,
          password: user.password,
          role: user.role,
          bio: user.bio,
          location: user.location,
          whatsappNumber: user.whatsappNumber,
          resetToken: user.resetToken,
          resetTokenExpiry: user.resetTokenExpiry ? new Date(user.resetTokenExpiry) : null,
          phoneVerificationToken: user.phoneVerificationToken,
          phoneVerificationExpiry: user.phoneVerificationExpiry ? new Date(user.phoneVerificationExpiry) : null,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
      console.log(`✅ User migrated: ${user.name || user.phone}`);
    }
    
    // Migrate Articles (if any)
    console.log('📝 Migrating articles...');
    const articles = sqliteDb.prepare('SELECT * FROM Article').all();
    
    for (const article of articles) {
      await prisma.article.upsert({
        where: { id: article.id },
        update: {
          title: article.title,
          description: article.description,
          price: article.price,
          images: article.images,
          size: article.size,
          condition: article.condition,
          isAvailable: Boolean(article.isAvailable),
          sellerId: article.sellerId,
          categoryId: article.categoryId,
          createdAt: new Date(article.createdAt),
          updatedAt: new Date(article.updatedAt)
        },
        create: {
          id: article.id,
          title: article.title,
          description: article.description,
          price: article.price,
          images: article.images,
          size: article.size,
          condition: article.condition,
          isAvailable: Boolean(article.isAvailable),
          sellerId: article.sellerId,
          categoryId: article.categoryId,
          createdAt: new Date(article.createdAt),
          updatedAt: new Date(article.updatedAt)
        }
      });
      console.log(`✅ Article migrated: ${article.title}`);
    }
    
    console.log('🎉 Data migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Articles: ${articles.length}`);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    sqliteDb.close();
    await prisma.$disconnect();
  }
}

migrateData();