const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^"|"$/g, '');
        process.env[key] = value;
      }
    }
  });
}

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking database data...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const articleCount = await prisma.article.count();
    
    console.log('📊 Data Summary:');
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   📂 Categories: ${categoryCount}`);
    console.log(`   📦 Articles: ${articleCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          role: true
        }
      });
      
      console.log('\n👥 Users in database:');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.role}) - ${user.phone}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();