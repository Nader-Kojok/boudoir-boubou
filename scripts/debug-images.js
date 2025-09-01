const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugImages() {
  try {
    // Récupérer quelques articles avec leurs images
    const articles = await prisma.article.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        images: true
      }
    });

    console.log('=== DEBUG IMAGES ===');
    
    articles.forEach((article, index) => {
      console.log(`\nArticle ${index + 1}: ${article.title}`);
      console.log('Images (raw):', article.images);
      
      try {
        const parsedImages = JSON.parse(article.images);
        console.log('Images (parsed):', parsedImages);
        console.log('Number of images:', parsedImages.length);
        
        parsedImages.forEach((img, imgIndex) => {
          console.log(`  Image ${imgIndex + 1}:`);
          console.log(`    Type: ${img.startsWith('data:') ? 'Data URL' : 'Regular URL'}`);
          console.log(`    Length: ${img.length} characters`);
          if (img.startsWith('data:')) {
            const mimeMatch = img.match(/data:([^;]+)/);
            console.log(`    MIME type: ${mimeMatch ? mimeMatch[1] : 'unknown'}`);
          }
          console.log(`    Preview: ${img.substring(0, 100)}...`);
        });
      } catch (error) {
        console.log('Error parsing images:', error.message);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugImages();