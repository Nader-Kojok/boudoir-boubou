const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Fonction pour convertir une image en base64 (simule l'upload utilisateur)
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const base64String = imageBuffer.toString('base64')
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
    return `data:${mimeType};base64,${base64String}`
  } catch (error) {
    console.error('Erreur lors de la conversion:', error)
    return null
  }
}

async function testRealUpload() {
  try {
    // Créer une image de test simple (pixel rouge)
    const redPixelBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    
    // Récupérer une catégorie existante
    const category = await prisma.category.findFirst()
    if (!category) {
      console.log('❌ Aucune catégorie trouvée. Veuillez d\'abord créer des catégories.')
      return
    }
    
    // Créer un article de test avec une vraie image base64
    const testArticle = await prisma.article.create({
      data: {
        title: 'Test Article avec Image Uploadée',
        description: 'Ceci est un test avec une vraie image uploadée par un utilisateur',
        price: 25.00,
        condition: 'EXCELLENT',
        size: 'M',
        images: JSON.stringify([redPixelBase64]),
        sellerId: 'cmcz5youx0000jr04lawv9cmt', // ID de Nader
        categoryId: category.id
      }
    })
    
    console.log('✅ Article de test créé avec succès:')
    console.log('ID:', testArticle.id)
    console.log('Titre:', testArticle.title)
    console.log('Images stockées:', testArticle.images)
    
    // Vérifier comment l'image est parsée
    const parsedImages = JSON.parse(testArticle.images)
    console.log('\n📸 Analyse des images:')
    console.log('Nombre d\'images:', parsedImages.length)
    console.log('Type de la première image:', parsedImages[0].startsWith('data:') ? 'Data URL (base64)' : 'URL normale')
    console.log('Début de l\'image:', parsedImages[0].substring(0, 50) + '...')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRealUpload()