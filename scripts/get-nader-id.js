const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getNaderId() {
  try {
    const nader = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Nader',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true
      }
    });
    
    if (nader) {
      console.log('👤 Utilisateur trouvé:');
      console.log(`ID: ${nader.id}`);
      console.log(`Nom: ${nader.name}`);
      console.log(`Téléphone: ${nader.phone}`);
      console.log(`Rôle: ${nader.role}`);
      console.log('');
      console.log(`🔗 URL de test: http://localhost:3000/test-dashboard?userId=${nader.id}`);
    } else {
      console.log('❌ Utilisateur Nader non trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getNaderId();