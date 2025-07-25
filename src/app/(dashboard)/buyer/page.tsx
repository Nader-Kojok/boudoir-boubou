'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ShoppingBag, 
  Heart, 
  Package, 
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface BuyerStats {
  totalOrders: number
  totalSpent: number
  favoriteItems: number
  pendingOrders: number
}

export default function BuyerDashboard() {
  const [stats, setStats] = useState<BuyerStats>({
    totalOrders: 0,
    totalSpent: 0,
    favoriteItems: 0,
    pendingOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/buyer/dashboard')
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }
      
      const data = await response.json()
      
      setStats(data.stats)
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      // En cas d'erreur, garder les données par défaut
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        favoriteItems: 0,
        pendingOrders: 0
      })
    } finally {
      setLoading(false)
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">Gérez vos achats et suivez vos commandes</p>
        </div>
        <Button asChild>
          <Link href="/catalogue">
            <Plus className="h-4 w-4 mr-2" />
            Continuer mes achats
          </Link>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles favoris</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favoriteItems}</div>
            <p className="text-xs text-muted-foreground">Articles que vous aimez</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions WhatsApp</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Contactez directement les vendeurs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catalogue</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">∞</div>
            <p className="text-xs text-muted-foreground">Articles disponibles</p>
          </CardContent>
        </Card>
        

      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild className="h-auto p-4 justify-start">
              <Link href="/catalogue">
                <ShoppingBag className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Parcourir le catalogue</div>
                  <div className="text-sm text-muted-foreground">Découvrez de nouveaux articles</div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/buyer/favoris">
                <Heart className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Mes favoris</div>
                  <div className="text-sm text-muted-foreground">Articles que vous aimez</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/buyer/commandes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Mes commandes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-600">Suivez l&apos;état de vos commandes et votre historique d&apos;achats</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/buyer/favoris">
          <Card className="hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Mes favoris</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-600">Retrouvez tous les articles que vous avez mis en favoris</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/catalogue">
          <Card className="hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5" />
                <span>Explorer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-600">Découvrez de nouveaux articles et faites de nouvelles trouvailles</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}