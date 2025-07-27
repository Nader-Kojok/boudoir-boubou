import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, XCircle, Clock, User, FileText, MessageSquare } from 'lucide-react'
import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { safeDbOperation } from '@/lib/db-connection'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ReportStatusBadge } from '@/components/custom/report-status-badge'
import { ReportActions } from '@/components/custom/report-actions'

interface SearchParams {
  status?: string
  type?: string
  page?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

export default async function SignalementsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const session = await getSession()
  
  if (!session || (session.user?.role !== 'MODERATOR' && session.user?.role !== 'ADMIN')) {
    redirect('/dashboard')
  }

  const page = parseInt(resolvedSearchParams.page || '1')
  const pageSize = 20
  const status = resolvedSearchParams.status
  const type = resolvedSearchParams.type

  // Construire les filtres
  const where: Record<string, string> = {}
  if (status && status !== 'all') {
    where.status = status
  }
  if (type && type !== 'all') {
    where.type = type
  }

  // Récupérer les signalements
  const reportsData = await safeDbOperation(
    async () => {
      const [reports, totalCount, stats] = await Promise.all([
        prisma.report.findMany({
          where,
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            },
            article: {
              select: {
                id: true,
                title: true,
                status: true
              }
            },
            review: {
              select: {
                id: true,
                comment: true,
                rating: true,
                reviewer: {
                  select: {
                    name: true
                  }
                }
              }
            },
            moderator: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        prisma.report.count({ where }),
        prisma.report.groupBy({
          by: ['status'],
          _count: {
            id: true
          }
        })
      ])

      return { reports, totalCount, stats }
    },
    'moderator-signalements'
  )

  const reports = reportsData?.reports || []
  const totalCount = reportsData?.totalCount || 0
  const stats = reportsData?.stats || []
  const totalPages = Math.ceil(totalCount / pageSize)

  // Calculer les statistiques
  const statsTyped = stats as Array<{ status: string; _count: { id: number } }>
  const pendingCount = statsTyped.find(s => s.status === 'PENDING')?._count.id || 0
  const resolvedCount = statsTyped.find(s => s.status === 'RESOLVED')?._count.id || 0
  const rejectedCount = statsTyped.find(s => s.status === 'REJECTED')?._count.id || 0

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'USER': return 'Utilisateur'
      case 'ARTICLE': return 'Article'
      case 'REVIEW': return 'Avis'
      default: return type
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'INAPPROPRIATE_CONTENT': return 'Contenu inapproprié'
      case 'SPAM': return 'Spam'
      case 'HARASSMENT': return 'Harcèlement'
      case 'FAKE_PROFILE': return 'Faux profil'
      case 'SCAM': return 'Arnaque'
      case 'COPYRIGHT': return 'Violation de droits d\'auteur'
      case 'OTHER': return 'Autre'
      default: return reason
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signalements</h1>
          <p className="text-muted-foreground">
            Gérez les signalements d&apos;utilisateurs, d&apos;articles et d&apos;avis
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Signalements à traiter
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Signalements traités
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Signalements rejetés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              Tous les signalements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <div className="flex gap-2">
                <Button variant={!status || status === 'all' ? 'default' : 'outline'} size="sm" asChild>
                  <Link href="/moderator/signalements">Tous</Link>
                </Button>
                <Button variant={status === 'PENDING' ? 'default' : 'outline'} size="sm" asChild>
                  <Link href="?status=PENDING">En attente</Link>
                </Button>
                <Button variant={status === 'RESOLVED' ? 'default' : 'outline'} size="sm" asChild>
                  <Link href="?status=RESOLVED">Résolus</Link>
                </Button>
                <Button variant={status === 'REJECTED' ? 'default' : 'outline'} size="sm" asChild>
                  <Link href="?status=REJECTED">Rejetés</Link>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-2">
                <Button variant={!type || type === 'all' ? 'default' : 'outline'} size="sm" asChild>
                  <Link href="/moderator/signalements">Tous</Link>
                </Button>
                <Button variant={type === 'USER' ? 'default' : 'outline'} size="sm" asChild>
                  <Link href="?type=USER">Utilisateurs</Link>
                </Button>
                <Button variant={type === 'ARTICLE' ? 'default' : 'outline'} size="sm" asChild>
                  <Link href="?type=ARTICLE">Articles</Link>
                </Button>
                <Button variant={type === 'REVIEW' ? 'default' : 'outline'} size="sm" asChild>
                  <Link href="?type=REVIEW">Avis</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des signalements */}
      <Card>
        <CardHeader>
          <CardTitle>Signalements ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun signalement</h3>
              <p className="text-muted-foreground">
                Aucun signalement ne correspond aux filtres sélectionnés.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getReportTypeLabel(report.type)}
                        </Badge>
                        <ReportStatusBadge status={report.status as "PENDING" | "RESOLVED" | "REJECTED"} />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(report.createdAt)}
                        </span>
                      </div>
                      
                      <div>
                        <p className="font-medium">{getReasonLabel(report.reason)}</p>
                        {report.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Signalé par: {report.reporter.name}</span>
                        {report.moderator && (
                          <span>Traité par: {report.moderator.name}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Lien vers le contenu signalé */}
                      {report.type === 'USER' && report.user && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/user/${report.user.id}`}>
                            <User className="h-4 w-4 mr-1" />
                            Voir profil
                          </Link>
                        </Button>
                      )}
                      
                      {report.type === 'ARTICLE' && report.article && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/article/${report.article.id}`}>
                            <FileText className="h-4 w-4 mr-1" />
                            Voir article
                          </Link>
                        </Button>
                      )}
                      
                      {report.type === 'REVIEW' && report.review && (
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Voir avis
                        </Button>
                      )}
                      
                      <ReportActions reportId={report.id} currentStatus={report.status as "PENDING" | "RESOLVED" | "REJECTED"} />
                    </div>
                  </div>
                  

                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Button variant="outline" asChild>
                <Link href={`?page=${page - 1}${status ? `&status=${status}` : ''}${type ? `&type=${type}` : ''}`}>
                  Précédent
                </Link>
              </Button>
            )}
            
            <span className="text-sm text-muted-foreground">
              Page {page} sur {totalPages}
            </span>
            
            {page < totalPages && (
              <Button variant="outline" asChild>
                <Link href={`?page=${page + 1}${status ? `&status=${status}` : ''}${type ? `&type=${type}` : ''}`}>
                  Suivant
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}