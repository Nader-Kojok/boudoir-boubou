import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { safeDbOperation } from '@/lib/db-connection'
import { prisma } from '@/lib/db'

export default async function ModeratorDashboard() {
  const session = await getSession()
  
  if (!session || session.user?.role !== 'MODERATOR') {
    redirect('/dashboard')
  }

  // Récupérer les statistiques de modération
  const stats = await safeDbOperation(
    async () => {
      const [pendingArticles, totalUsers, recentReports, pendingReports] = await Promise.all([
        prisma.article.count({
          where: { status: 'PENDING_MODERATION' }
        }),
        prisma.user.count({
          where: {
            role: {
              not: 'ADMIN'
            }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
            }
          }
        }),
        prisma.report.count({
          where: { status: 'PENDING' }
        })
      ])
      
      return {
        pendingArticles,
        totalUsers,
        recentReports,
        pendingReports
      }
    },
    'moderator-dashboard-stats'
  )

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Modérateur</h1>
          <p className="text-muted-foreground">
            Bienvenue {session.user.name}, voici un aperçu de vos tâches de modération
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Modérateur
        </Badge>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles en attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingArticles || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une modération
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs inscrits
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.recentReports || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Actif</div>
            <p className="text-xs text-muted-foreground">
              Système opérationnel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Actions de modération
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Articles en attente</span>
              </div>
              <Badge variant="outline">{stats?.pendingArticles || 0}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Signalements</span>
              </div>
              <Badge variant="outline">{stats?.pendingReports || 0}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Rapports générés</span>
              </div>
              <Badge variant="outline">0</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion des utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Utilisateurs actifs</span>
              </div>
              <Badge variant="outline">{stats?.totalUsers || 0}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Comptes suspendus</span>
              </div>
              <Badge variant="outline">0</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Comptes vérifiés</span>
              </div>
              <Badge variant="outline">0</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}