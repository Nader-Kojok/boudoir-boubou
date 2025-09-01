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
      image: '/categories/mariage.webp'
    },
    {
      name: 'Tenues de soirée',
      slug: 'soiree',
      description: 'Robes élégantes et tenues chic pour vos événements spéciaux',
      image: '/categories/soiree.webp'
    },
    {
      name: 'Vêtements traditionnels',
      slug: 'traditionnel',
      description: 'Boubous, bazin riche et tenues traditionnelles sénégalaises',
      image: '/categories/tradi.webp'
    },
    {
      name: 'Vêtements casual',
      slug: 'casual',
      description: 'Tenues décontractées pour le quotidien',
      image: '/categories/tradi-casual.webp'
    },
    {
      name: 'Accessoires',
      slug: 'accessoires',
      description: 'Bijoux, sacs, chaussures et autres accessoires de mode',
      image: '/categories/accessoire.webp'
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