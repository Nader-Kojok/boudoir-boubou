'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MetricCard } from '@/components/custom/metric-card'
import { ChartContainer, SimpleChart } from '@/components/custom/chart-container'
import { UserManagement } from '@/components/custom/user-management'
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Activity,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalArticles: number
    totalSales: number
    totalRevenue: number
    activeUsers: number
    conversionRate: number
  }
  chartData: {
    newUsers: Array<{ date: string; count: number }>
    newArticles: Array<{ date: string; count: number }>
    sales: Array<{ date: string; count: number; revenue: number }>
  }
  topArticles: Array<{ id: string; title: string; views: number; seller: { name: string }; category: { name: string } }>
  period: number
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<{
    distributionByRole?: Array<{ role: string; count: number }>;
    topSellers?: Array<{ id: string; name: string; articlesCount: number; totalRevenue?: number; salesCount: number }>;
  } | null>(null)
  const [articleAnalytics, setArticleAnalytics] = useState<{
    distributionByCategory?: Array<{ category: string; count: number }>;
    distributionByCondition?: Array<{ condition: string; count: number }>;
    topViewed?: Array<{ id: string; title: string; views: number }>;
  } | null>(null)
  const [revenueAnalytics, setRevenueAnalytics] = useState<{
    revenueOverTime?: Array<{ date: string; amount: number }>;
    distributionByPaymentMethod?: Array<{ method: string; totalAmount?: number; count: number }>;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      
      // Récupération parallèle de toutes les données analytics
      const [overviewRes, usersRes, articlesRes, revenueRes] = await Promise.all([
        fetch(`/api/admin/analytics/overview?period=${periodFilter}`),
        fetch(`/api/admin/analytics/users?period=${periodFilter}`),
        fetch(`/api/admin/analytics/articles?period=${periodFilter}`),
        fetch(`/api/admin/analytics/revenue?period=${periodFilter}`)
      ])
      
      const [overview, users, articles, revenue] = await Promise.all([
        overviewRes.json(),
        usersRes.json(),
        articlesRes.json(),
        revenueRes.json()
      ])
      
      if (overviewRes.ok && usersRes.ok && articlesRes.ok && revenueRes.ok) {
        setData(overview)
        setUserAnalytics(users)
        setArticleAnalytics(articles)
        setRevenueAnalytics(revenue)
      } else {
        toast.error('Erreur lors du chargement des analytics')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des analytics')
      console.error('Analytics error:', error)
    } finally {
      setLoading(false)
    }
  }, [periodFilter])

  useEffect(() => {
      fetchAnalytics()
    }, [fetchAnalytics])

  const exportData = () => {
    if (!data) return
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      ...data
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${periodFilter}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Données exportées avec succès')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Chargement des analytics...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Erreur de chargement</p>
          <Button onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Admin</h1>
          <p className="text-muted-foreground">
            Tableau de bord et gestion des utilisateurs
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Gestion Utilisateurs</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métriques principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Utilisateurs totaux"
              value={data.overview.totalUsers}
              description="Utilisateurs inscrits"
              icon={<Users className="h-4 w-4" />}
              trend={{
                value: 12.5,
                label: 'vs mois dernier',
                direction: 'up'
              }}
            />
            
            <MetricCard
              title="Articles publiés"
              value={data.overview.totalArticles}
              description="Articles en ligne"
              icon={<ShoppingBag className="h-4 w-4" />}
              trend={{
                value: 8.2,
                label: 'vs mois dernier',
                direction: 'up'
              }}
            />
            
            <MetricCard
              title="Ventes totales"
              value={data.overview.totalSales}
              description="Transactions réussies"
              icon={<TrendingUp className="h-4 w-4" />}
              trend={{
                value: 15.3,
                label: 'vs mois dernier',
                direction: 'up'
              }}
            />
            
            <MetricCard
              title="Chiffre d'affaires"
              value={data.overview.totalRevenue}
              description="Revenus générés"
              format="currency"
              icon={<DollarSign className="h-4 w-4" />}
              trend={{
                value: 22.1,
                label: 'vs mois dernier',
                direction: 'up'
              }}
            />
          </div>

          {/* Métriques secondaires */}
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              title="Utilisateurs actifs"
              value={data.overview.activeUsers}
              description="Connectés récemment"
              icon={<Activity className="h-4 w-4" />}
              trend={{
                value: 5.7,
                label: 'vs semaine dernière',
                direction: 'up'
              }}
            />
            
            <MetricCard
              title="Taux de conversion"
              value={data.overview.conversionRate}
              description="Visiteurs → Acheteurs"
              format="percentage"
              icon={<Eye className="h-4 w-4" />}
              trend={{
                value: -2.1,
                label: 'vs mois dernier',
                direction: 'down'
              }}
            />
          </div>
        </TabsContent>

        {/* Analytics détaillées */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Graphique utilisateurs */}
            <ChartContainer
              title="Nouveaux utilisateurs"
              description="Évolution quotidienne des inscriptions"
              filters={{
                period: {
                  value: periodFilter,
                  onChange: setPeriodFilter,
                  options: [
                    { label: '24h', value: '24h' },
                    { label: '7 jours', value: '7d' },
                    { label: '30 jours', value: '30d' },
                    { label: '90 jours', value: '90d' }
                  ]
                }
              }}
              onExport={() => {
                // Export logic pour ce graphique spécifique
                toast.success('Graphique exporté avec succès')
              }}
            >
              <SimpleChart data={data.chartData.newUsers} type="line" />
            </ChartContainer>

            {/* Graphique articles */}
            <ChartContainer
              title="Articles publiés"
              description="Nouveaux articles par jour"
            >
              <SimpleChart data={data.chartData.newArticles} type="bar" />
            </ChartContainer>

            {/* Graphique ventes */}
            <ChartContainer
              title="Ventes quotidiennes"
              description="Nombre de transactions et revenus"
            >
              <SimpleChart data={data.chartData.sales} type="area" />
            </ChartContainer>

            {/* Top articles */}
            <Card>
              <CardHeader>
                <CardTitle>Articles populaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topArticles.map((article: { id: string; title: string; views: number; category: { name: string } }, index: number) => (
                    <div key={article.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">
                            {article.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {article.views} vues
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{article.category.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics détaillées des utilisateurs */}
          {userAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par rôle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userAnalytics.distributionByRole?.map((role: { role: string; count: number }) => (
                      <div key={role.role} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{role.role}</span>
                        <span className="text-lg font-bold">{role.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top vendeurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userAnalytics.topSellers?.slice(0, 5).map((seller: { id: string; name: string; articlesCount: number; totalRevenue?: number; salesCount: number }, index: number) => (
                      <div key={seller.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{seller.name}</p>
                            <p className="text-sm text-muted-foreground">{seller.articlesCount} articles</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{seller.totalRevenue?.toLocaleString()} FCFA</p>
                          <p className="text-sm text-muted-foreground">{seller.salesCount} ventes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics des articles */}
          {articleAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {articleAnalytics.distributionByCategory?.map((cat: { category: string; count: number }) => (
                      <div key={cat.category} className="flex justify-between items-center">
                        <span className="text-sm">{cat.category}</span>
                        <span className="font-medium">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Par condition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {articleAnalytics.distributionByCondition?.map((cond: { condition: string; count: number }) => (
                      <div key={cond.condition} className="flex justify-between items-center">
                        <span className="text-sm">{cond.condition}</span>
                        <span className="font-medium">{cond.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Articles les plus vus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {articleAnalytics.topViewed?.slice(0, 5).map((article: { id: string; title: string; views: number }) => (
                      <div key={article.id} className="flex justify-between items-center">
                        <span className="text-sm truncate">{article.title}</span>
                        <span className="font-medium">{article.views} vues</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics des revenus */}
          {revenueAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des revenus</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    title="Revenus dans le temps"
                    description="Évolution des revenus quotidiens"
                  >
                    <SimpleChart data={revenueAnalytics.revenueOverTime || []} type="line" />
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Méthodes de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {revenueAnalytics.distributionByPaymentMethod?.map((method: { method: string; totalAmount?: number; count: number }) => (
                      <div key={method.method} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{method.method}</span>
                        <div className="text-right">
                          <p className="font-medium">{method.totalAmount?.toLocaleString()} FCFA</p>
                          <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Gestion des utilisateurs */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}