import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer les catégories de base
  const categories = [
    {
      name: 'Tenues de mariage',
      slug: 'mariage',
      description: 'Robes de mariée, tenues de cérémonie et accessoires pour votre jour J',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop&crop=center&auto=format&q=80'
    },
    {
      name: 'Tenues de soirée',
      slug: 'soiree',
      description: 'Robes élégantes et tenues chic pour vos événements spéciaux',
      image: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b8b1e0?w=400&h=300&fit=crop&crop=center&auto=format&q=80'
    },
    {
      name: 'Vêtements traditionnels',
      slug: 'traditionnel',
      description: 'Boubous, bazin riche et tenues traditionnelles sénégalaises',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&auto=format&q=80'
    },
    {
      name: 'Vêtements casual',
      slug: 'casual',
      description: 'Tenues décontractées pour le quotidien',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop&crop=center&auto=format&q=80'
    },
    {
      name: 'Accessoires',
      slug: 'accessoires',
      description: 'Bijoux, sacs, chaussures et autres accessoires de mode',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop&crop=center&auto=format&q=80'
    }
  ]

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: category.slug }
    })

    if (!existingCategory) {
      await prisma.category.create({
        data: category
      })
      console.log(`✅ Catégorie créée: ${category.name}`)
    } else {
      console.log(`⏭️  Catégorie existe déjà: ${category.name}`)
    }
  }

  console.log('🎉 Seeding terminé!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })