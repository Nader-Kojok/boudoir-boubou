const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^"|"$/g, '');
      process.env[key] = value;
    }
  });
}

async function checkUserTableSchema() {
  console.log('PRISMA_DATABASE_URL:', process.env.PRISMA_DATABASE_URL ? 'Found' : 'Not found');
  
  // Use the DATABASE_URL (now pointing to the correct database)
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  try {
    console.log('Checking User table schema...')
    
    // Check if we can query the User table structure
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    console.log('User table columns:')
    console.table(result)
    
    // Check if phone column exists specifically
    const phoneColumn = result.find(col => col.column_name === 'phone')
    console.log('\nPhone column exists:', !!phoneColumn)
    
    if (phoneColumn) {
      console.log('Phone column details:', phoneColumn)
    }
    
    // Try to count users to test basic connectivity
    const userCount = await prisma.user.count()
    console.log('\nTotal users in database:', userCount)
    
  } catch (error) {
    console.error('Error checking schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserTableSchema()