'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Package, 
  Eye, 
  Heart,
  BarChart3,
  PieChart
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsPeriod {
  period: string
  sales: number
  revenue: number
  views: number
  favorites: number
}

interface CategoryStats {
  category: string
  sales: number
  revenue: number
  percentage: number
}

interface MonthlyData {
  month: string
  sales: number
  revenue: number
}

export default function StatistiquesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [loading, setLoading] = useState(true)
  const [currentStats, setCurrentStats] = useState<StatsPeriod>({
    period: '30 derniers jours',
    sales: 0,
    revenue: 0,
    views: 0,
    favorites: 0
  })
  const [previousStats, setPreviousStats] = useState<StatsPeriod>({
    period: '30 jours précédents',
    sales: 0,
    revenue: 0,
    views: 0,
    favorites: 0
  })
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])  
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true)
      // Simulation de données - à remplacer par de vrais appels API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const periodMultiplier = selectedPeriod === '7' ? 0.3 : selectedPeriod === '30' ? 1 : 3
      
      setCurrentStats({
        period: `${selectedPeriod} derniers jours`,
        sales: Math.floor(24 * periodMultiplier),
        revenue: Math.floor(1250 * periodMultiplier),
        views: Math.floor(1847 * periodMultiplier),
        favorites: Math.floor(156 * periodMultiplier)
      })

      setPreviousStats({
        period: `${selectedPeriod} jours précédents`,
        sales: Math.floor(18 * periodMultiplier),
        revenue: Math.floor(980 * periodMultiplier),
        views: Math.floor(1456 * periodMultiplier),
        favorites: Math.floor(134 * periodMultiplier)
      })

      setCategoryStats([
        { category: 'Robes', sales: 12, revenue: 720, percentage: 35 },
        { category: 'Ensembles', sales: 8, revenue: 480, percentage: 25 },
        { category: 'Accessoires', sales: 15, revenue: 225, percentage: 20 },
        { category: 'Chaussures', sales: 6, revenue: 180, percentage: 12 },
        { category: 'Bijoux', sales: 10, revenue: 150, percentage: 8 }
      ])

      setMonthlyData([
        { month: 'Oct', sales: 18, revenue: 980 },
        { month: 'Nov', sales: 22, revenue: 1150 },
        { month: 'Déc', sales: 28, revenue: 1420 },
        { month: 'Jan', sales: 24, revenue: 1250 }
      ])
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-100' : 'bg-red-100'
    }
  }

  const salesGrowth = formatGrowth(calculateGrowth(currentStats.sales, previousStats.sales))
  const revenueGrowth = formatGrowth(calculateGrowth(currentStats.revenue, previousStats.revenue))
  const viewsGrowth = formatGrowth(calculateGrowth(currentStats.views, previousStats.views))
  const favoritesGrowth = formatGrowth(calculateGrowth(currentStats.favorites, previousStats.favorites))

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
          <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600 mt-1">Analysez vos performances de vente</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards avec comparaison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.sales}</div>
            <div className={cn(
              "flex items-center text-xs mt-1 px-2 py-1 rounded-full w-fit",
              salesGrowth.bgColor
            )}>
              <salesGrowth.icon className={cn("w-3 h-3 mr-1", salesGrowth.color)} />
              <span className={salesGrowth.color}>
                {salesGrowth.value}% vs période précédente
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.revenue}€</div>
            <div className={cn(
              "flex items-center text-xs mt-1 px-2 py-1 rounded-full w-fit",
              revenueGrowth.bgColor
            )}>
              <revenueGrowth.icon className={cn("w-3 h-3 mr-1", revenueGrowth.color)} />
              <span className={revenueGrowth.color}>
                {revenueGrowth.value}% vs période précédente
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.views}</div>
            <div className={cn(
              "flex items-center text-xs mt-1 px-2 py-1 rounded-full w-fit",
              viewsGrowth.bgColor
            )}>
              <viewsGrowth.icon className={cn("w-3 h-3 mr-1", viewsGrowth.color)} />
              <span className={viewsGrowth.color}>
                {viewsGrowth.value}% vs période précédente
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoris</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.favorites}</div>
            <div className={cn(
              "flex items-center text-xs mt-1 px-2 py-1 rounded-full w-fit",
              favoritesGrowth.bgColor
            )}>
              <favoritesGrowth.icon className={cn("w-3 h-3 mr-1", favoritesGrowth.color)} />
              <span className={favoritesGrowth.color}>
                {favoritesGrowth.value}% vs période précédente
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Évolution mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium">{data.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-medium">{data.sales}</span> ventes
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {data.revenue}€
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-boudoir-ocre-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(data.sales / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Ventes par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category, categoryIndex) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-4 h-4 rounded-full",
                      categoryIndex === 0 ? "bg-boudoir-ocre-500" :
                      categoryIndex === 1 ? "bg-boudoir-vert-eau-500" :
                      categoryIndex === 2 ? "bg-blue-500" :
                      categoryIndex === 3 ? "bg-purple-500" : "bg-pink-500"
                    )}></div>
                    <div>
                      <p className="font-medium text-sm">{category.category}</p>
                      <p className="text-xs text-gray-600">{category.sales} ventes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{category.revenue}€</p>
                    <p className="text-xs text-gray-600">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métriques détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Métriques détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-boudoir-ocre-600">
                {currentStats.revenue > 0 ? (currentStats.revenue / currentStats.sales).toFixed(0) : 0}€
              </div>
              <p className="text-sm text-gray-600 mt-1">Prix moyen par vente</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-boudoir-vert-eau-600">
                {currentStats.views > 0 ? ((currentStats.sales / currentStats.views) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Taux de conversion</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentStats.favorites > 0 ? (currentStats.views / currentStats.favorites).toFixed(1) : 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">Vues par favori</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}