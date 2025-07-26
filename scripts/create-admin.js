const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Création d\'un utilisateur administrateur...');
    
    // Données de l'administrateur
    const adminData = {
      name: 'Administrateur',
      phone: '+221700000000', // Numéro par défaut
      password: 'Admin123!', // Mot de passe par défaut
      role: 'ADMIN'
    };
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà:', existingAdmin.name);
      console.log('📱 Téléphone:', existingAdmin.phone);
      return;
    }
    
    // Vérifier si le numéro de téléphone est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { phone: adminData.phone }
    });
    
    if (existingUser) {
      console.log('❌ Ce numéro de téléphone est déjà utilisé par:', existingUser.name);
      console.log('💡 Modifiez le numéro dans le script ou supprimez l\'utilisateur existant.');
      return;
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        name: adminData.name,
        phone: adminData.phone,
        password: hashedPassword,
        role: adminData.role,
        phoneVerified: new Date(), // Marquer comme vérifié
        bio: 'Administrateur de la plateforme Boudoir',
        whatsappNumber: adminData.phone
      }
    });
    
    console.log('✅ Administrateur créé avec succès!');
    console.log('📋 Informations de connexion:');
    console.log('   📱 Téléphone:', adminData.phone);
    console.log('   🔑 Mot de passe:', adminData.password);
    console.log('   👤 Nom:', admin.name);
    console.log('   🆔 ID:', admin.id);
    console.log('');
    console.log('🌐 Accès au dashboard administrateur:');
    console.log('   📍 URL: /admin/moderation');
    console.log('   ⚡ Connectez-vous d\'abord avec les identifiants ci-dessus');
    console.log('');
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();