import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/db'

export async function GET() {
  try {
    const categories = await getCategories()
    
    // Transformer les données pour correspondre au format attendu par le frontend
    // Limiter à 4 catégories pour éviter les retours à la ligne
    const categoryStats = categories.slice(0, 4).map(category => ({
      id: category.slug,
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      productCount: category._count.articles
    }))
    
    return NextResponse.json(categoryStats)
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des catégories:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}