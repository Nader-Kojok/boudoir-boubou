'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { 
  TrendingUp, 
  Package, 
  Eye, 
  Heart, 
  ShoppingCart,
  Plus,
  DollarSign,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalSales: number
  totalRevenue: number
  activeArticles: number
  totalViews: number
  thisMonthSales: number
  salesGrowth: number
}

interface Article {
  id: string
  title: string
  price: number
  images: string[]
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR'
  isAvailable: boolean
  views: number
  favorites: number
  createdAt: string
  category: {
    name: string
  }
}



interface Sale {
  id: string
  articleTitle: string
  buyerName: string
  amount: number
  date: string
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED'
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    activeArticles: 0,
    totalViews: 0,
    thisMonthSales: 0,
    salesGrowth: 0
  })
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Simulation de données - à remplacer par de vrais appels API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalSales: 24,
        totalRevenue: 1250,
        activeArticles: 12,
        totalViews: 1847,
        thisMonthSales: 8,
        salesGrowth: 15.2
      })

      setRecentArticles([
        {
          id: '1',
          title: 'Robe Wax Élégante',
          price: 85,
          images: ['/placeholder-product.jpg'],
          condition: 'EXCELLENT',
          isAvailable: true,
          views: 124,
          favorites: 8,
          createdAt: '2024-01-15',
          category: { name: 'Robes' }
        },
        {
          id: '2',
          title: 'Ensemble Traditionnel',
          price: 120,
          images: ['/placeholder-product.jpg'],
          condition: 'GOOD',
          isAvailable: true,
          views: 89,
          favorites: 5,
          createdAt: '2024-01-12',
          category: { name: 'Ensembles' }
        }
      ])



      setRecentSales([
        {
          id: '1',
          articleTitle: 'Boubou Brodé',
          buyerName: 'Aminata K.',
          amount: 95,
          date: '2024-01-15',
          status: 'COMPLETED'
        },
        {
          id: '2',
          articleTitle: 'Headwrap Coloré',
          buyerName: 'Fatou S.',
          amount: 25,
          date: '2024-01-14',
          status: 'COMPLETED'
        }
      ])
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: Sale['status']) => {
    const variants = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      COMPLETED: 'Terminée',
      PENDING: 'En attente',
      CANCELLED: 'Annulée'
    }

    return (
      <Badge className={cn('text-xs', variants[status])}>
        {labels[status]}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Vendeur</h1>
          <p className="text-gray-600 mt-1">Gérez vos ventes et suivez vos performances</p>
        </div>
        <Link href="/seller/vendre">
          <Button className="bg-boudoir-ocre-500 hover:bg-boudoir-ocre-600">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un article
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisMonthSales} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue}€</div>
            <p className="text-xs text-muted-foreground">
              +{stats.salesGrowth}% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles actifs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeArticles}</div>
            <p className="text-xs text-muted-foreground">
              Articles en vente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vue d'ensemble des ventes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ventes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{sale.articleTitle}</p>
                  <p className="text-xs text-gray-600">Acheteur: {sale.buyerName}</p>
                  <p className="text-xs text-gray-500">{formatDate(sale.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{sale.amount}€</p>
                  {getStatusBadge(sale.status)}
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <p className="text-center text-gray-500 py-4">Aucune vente récente</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Articles en cours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Articles en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article) => (
              <div key={article.id} className="border rounded-lg p-4 space-y-3">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{article.title}</h3>
                  <p className="text-lg font-bold text-boudoir-ocre-600">{article.price}€</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {article.favorites}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {recentArticles.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucun article en cours</p>
              <Link href="/seller/vendre">
                <Button className="bg-boudoir-ocre-500 hover:bg-boudoir-ocre-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter votre premier article
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}