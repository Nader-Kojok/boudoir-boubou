const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixImages() {
  try {
    console.log('=== FIXING IMAGES DATA ===');
    
    // Récupérer tous les articles
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        images: true
      }
    });

    console.log(`Found ${articles.length} articles`);
    
    let fixedCount = 0;
    
    for (const article of articles) {
      console.log(`\nChecking article: ${article.title}`);
      console.log('Current images value:', article.images);
      
      let needsUpdate = false;
      let newImages = article.images;
      
      // Vérifier si images est null ou undefined
      if (!article.images) {
        console.log('  -> Images is null/undefined, setting to empty array');
        newImages = '[]';
        needsUpdate = true;
      } else {
        // Vérifier si c'est un JSON valide
        try {
          const parsed = JSON.parse(article.images);
          if (!Array.isArray(parsed)) {
            console.log('  -> Images is not an array, converting to array');
            newImages = JSON.stringify([]);
            needsUpdate = true;
          } else {
            console.log(`  -> Images is valid array with ${parsed.length} items`);
          }
        } catch (error) {
          console.log('  -> Invalid JSON, setting to empty array');
          console.log('  -> Error:', error.message);
          newImages = '[]';
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await prisma.article.update({
          where: { id: article.id },
          data: { images: newImages }
        });
        console.log('  -> Updated!');
        fixedCount++;
      }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total articles: ${articles.length}`);
    console.log(`Fixed articles: ${fixedCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImages();