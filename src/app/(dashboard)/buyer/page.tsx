'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingBag, 
  Heart, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  articleTitle: string
  sellerName: string
  amount: number
  date: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
}

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
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Données mockées
      setStats({
        totalOrders: 12,
        totalSpent: 450.00,
        favoriteItems: 8,
        pendingOrders: 2
      })
      
      setRecentOrders([
        {
          id: '1',
          articleTitle: 'Robe élégante noire',
          sellerName: 'Marie Dubois',
          amount: 85.00,
          date: '2024-01-15',
          status: 'DELIVERED'
        },
        {
          id: '2',
          articleTitle: 'Sac à main vintage',
          sellerName: 'Sophie Martin',
          amount: 65.00,
          date: '2024-01-12',
          status: 'SHIPPED'
        },
        {
          id: '3',
          articleTitle: 'Chaussures à talons',
          sellerName: 'Claire Rousseau',
          amount: 120.00,
          date: '2024-01-10',
          status: 'PENDING'
        }
      ])
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      PENDING: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      CONFIRMED: { label: 'Confirmée', variant: 'default' as const, icon: CheckCircle },
      SHIPPED: { label: 'Expédiée', variant: 'default' as const, icon: Package },
      DELIVERED: { label: 'Livrée', variant: 'default' as const, icon: CheckCircle },
      CANCELLED: { label: 'Annulée', variant: 'destructive' as const, icon: XCircle }
    }
    
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
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
            <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Depuis votre inscription</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total dépensé</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpent.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">Toutes commandes confondues</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles favoris</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favoriteItems}</div>
            <p className="text-xs text-muted-foreground">Dans votre liste de souhaits</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes en cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">En attente de traitement</p>
          </CardContent>
        </Card>
      </div>

      {/* Commandes récentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Commandes récentes</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/buyer/commandes">Voir toutes</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune commande récente</p>
              <Button className="mt-4" asChild>
                <Link href="/catalogue">Commencer mes achats</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{order.articleTitle}</h3>
                    <p className="text-sm text-gray-600">Vendu par {order.sellerName}</p>
                    <p className="text-xs text-gray-500">Commandé le {new Date(order.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-900">{order.amount.toFixed(2)} €</span>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/buyer/commandes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Mes commandes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Suivez l&apos;état de vos commandes et votre historique d&apos;achats</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/buyer/favoris">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Mes favoris</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Retrouvez tous les articles que vous avez mis en favoris</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/catalogue">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5" />
                <span>Explorer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Découvrez de nouveaux articles et faites de nouvelles trouvailles</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}