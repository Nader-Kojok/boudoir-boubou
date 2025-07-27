import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, Calendar, TrendingUp, Users, ShoppingBag, AlertTriangle } from 'lucide-react'
import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { safeDbOperation } from '@/lib/db-connection'
import { prisma } from '@/lib/db'

export default async function ModeratorReportsPage() {
  const session = await getSession()
  
  if (!session || session.user?.role !== 'MODERATOR') {
    redirect('/dashboard')
  }

  // Récupérer les données pour les rapports
  const reportData = await safeDbOperation(
    async () => {
      const now = new Date()
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      const [weeklyUsers, monthlyUsers, weeklyArticles, monthlyArticles, pendingModeration, totalUsers] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: lastWeek
            },
            role: {
              not: 'ADMIN'
            }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: lastMonth
            },
            role: {
              not: 'ADMIN'
            }
          }
        }),
        prisma.article.count({
          where: {
            createdAt: {
              gte: lastWeek
            }
          }
        }),
        prisma.article.count({
          where: {
            createdAt: {
              gte: lastMonth
            }
          }
        }),
        prisma.article.count({
          where: {
            status: 'PENDING_MODERATION'
          }
        }),
        prisma.user.count({
          where: {
            role: {
              not: 'ADMIN'
            }
          }
        })
      ])
      
      return {
        weeklyUsers,
        monthlyUsers,
        weeklyArticles,
        monthlyArticles,
        pendingModeration,
        totalUsers
      }
    },
    'moderator-reports-data'
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const reports = [
    {
      id: 'weekly-activity',
      title: 'Rapport d&apos;activité hebdomadaire',
      description: 'Résumé de l\'activité des 7 derniers jours',
      icon: Calendar,
      data: {
        'Nouveaux utilisateurs': reportData?.weeklyUsers || 0,
        'Nouveaux articles': reportData?.weeklyArticles || 0,
        'Articles en modération': reportData?.pendingModeration || 0
      },
      period: '7 derniers jours'
    },
    {
      id: 'monthly-summary',
      title: 'Résumé mensuel',
      description: 'Vue d&apos;ensemble des 30 derniers jours',
      icon: TrendingUp,
      data: {
        'Nouveaux utilisateurs': reportData?.monthlyUsers || 0,
        'Nouveaux articles': reportData?.monthlyArticles || 0,
        'Total utilisateurs': reportData?.totalUsers || 0
      },
      period: '30 derniers jours'
    },
    {
      id: 'moderation-status',
      title: 'État de la modération',
      description: 'Statut actuel des tâches de modération',
      icon: AlertTriangle,
      data: {
        'Articles en attente': reportData?.pendingModeration || 0,
        'Articles traités (semaine)': (reportData?.weeklyArticles || 0) - (reportData?.pendingModeration || 0),
        'Taux de traitement': reportData?.weeklyArticles ? Math.round(((reportData.weeklyArticles - reportData.pendingModeration) / reportData.weeklyArticles) * 100) : 0
      },
      period: 'Temps réel'
    }
  ]

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports de Modération</h1>
          <p className="text-muted-foreground">
            Consultez et téléchargez les rapports d&apos;activité et de modération
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Mis à jour: {formatDate(new Date())}
        </Badge>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.weeklyUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux articles</CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.weeklyArticles || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En modération</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{reportData?.pendingModeration || 0}</div>
            <p className="text-xs text-muted-foreground">
              Articles en attente
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tous les utilisateurs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rapports disponibles */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon
          
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {report.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {Object.entries(report.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{key}</span>
                      <span className="font-medium">
                        {typeof value === 'number' && key.includes('Taux') ? `${value}%` : value}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground">Période: {report.period}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Voir détails
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <span className="text-sm">Exporter tout</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Rapport personnalisé</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Tendances</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm">Alertes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}