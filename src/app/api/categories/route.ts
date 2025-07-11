import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: {
            articles: {
              where: {
                isAvailable: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json(categories)
    
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}