import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est un acheteur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || (user.role !== 'BUYER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const buyerId = session.user.id

    // Récupérer les statistiques
    const [favoriteItems] = await Promise.all([
      // Articles favoris
      prisma.favorite.count({
        where: {
          userId: buyerId
        }
      })
    ])

    const stats = {
      totalOrders: 0, // Plus de système de commandes
      totalSpent: 0,  // Plus de tracking automatique des dépenses
      favoriteItems,
      pendingOrders: 0 // Plus de commandes en attente
    }

    return NextResponse.json({
      stats,
      recentOrders: [] // Plus de commandes récentes
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des données du dashboard buyer:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}