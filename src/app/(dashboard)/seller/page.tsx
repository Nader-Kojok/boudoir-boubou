'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArticleActionsDropdown } from '@/components/custom/article-actions-dropdown'

import { 
  TrendingUp, 
  Package, 
  Eye, 
  Heart, 
  ShoppingCart,
  Plus,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ImageGallery } from '@/components/custom/image-gallery'

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
  status: 'DELIVERED' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED'
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
      
      // Récupérer les données du tableau de bord
      const response = await fetch('/api/seller/dashboard')
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }
      
      const data = await response.json()
      
      setStats(data.stats)
      setRecentArticles(data.recentArticles)
      setRecentSales(data.recentSales)
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      // En cas d'erreur, garder les données par défaut
      setStats({
        totalSales: 0,
        totalRevenue: 0,
        activeArticles: 0,
        totalViews: 0,
        thisMonthSales: 0,
        salesGrowth: 0
      })
      setRecentArticles([])
      setRecentSales([])
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
      DELIVERED: 'bg-green-100 text-green-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      DELIVERED: 'Livrée',
      CONFIRMED: 'Confirmée',
      SHIPPED: 'Expédiée',
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
          <Button className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un article
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue}F</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof window !== 'undefined' ? (
                JSON.parse(localStorage.getItem('article-drafts') || '[]').length
              ) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <Link href="/seller/brouillons" className="text-boudoir-ocre-600 hover:underline">
                Voir les brouillons
              </Link>
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
                  <p className="font-bold text-green-600">{sale.amount}F</p>
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
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos articles actuellement en vente
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article) => (
              <div key={article.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full">
                <Link href={`/article/${article.id}`} className="block cursor-pointer">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {article.images && article.images.length > 0 ? (
                      <ImageGallery
                        images={article.images}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        showThumbnails={false}
                        showControls={false}
                        showExpandButton={false}
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                </Link>
                <div className="p-4 space-y-3 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-boudoir-ocre-600 transition-colors">{article.title}</h3>
                    <p className="text-lg font-bold text-boudoir-ocre-600 mt-1">{article.price}F</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {article.favorites || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = `/seller/vendre?edit=${article.id}`
                      }}
                    >
                      Modifier
                    </Button>
                    <ArticleActionsDropdown 
                       articleId={article.id}
                       articleTitle={article.title}
                       onStatusChange={() => {
                         // Recharger la page pour mettre à jour la liste
                         window.location.reload()
                       }}
                     />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {recentArticles.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucun article en cours</p>
              <Link href="/seller/vendre">
                <Button className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white shadow-lg hover:shadow-xl transition-all duration-300">
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