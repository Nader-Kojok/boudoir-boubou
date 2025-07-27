import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Search, Filter, UserCheck, UserX, Shield, ShoppingBag, Store } from 'lucide-react'
import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { safeDbOperation } from '@/lib/db-connection'
import { prisma } from '@/lib/db'

export default async function ModeratorUsersPage() {
  const session = await getSession()
  
  if (!session || session.user?.role !== 'MODERATOR') {
    redirect('/dashboard')
  }

  // Récupérer les utilisateurs avec leurs statistiques (sauf les administrateurs)
  const users = await safeDbOperation(
    async () => {
      return await prisma.user.findMany({
        where: {
          role: {
            not: 'ADMIN'
          }
        },
        select: {
          id: true,
          name: true,
          phone: true,
          image: true,
          role: true,
          status: true,
          location: true,
          createdAt: true,
          lastLoginAt: true,
          isVerified: true,
          _count: {
            select: {
              articles: true,
              favorites: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Limiter pour les performances
      })
    },
    'moderator-users-list'
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
      case 'MODERATOR':
        return <Shield className="h-4 w-4" />
      case 'SELLER':
        return <Store className="h-4 w-4" />
      case 'BUYER':
        return <ShoppingBag className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur'
      case 'MODERATOR':
        return 'Modérateur'
      case 'SELLER':
        return 'Vendeur'
      case 'BUYER':
        return 'Acheteur'
      default:
        return role
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800'
      case 'BANNED':
        return 'bg-red-100 text-red-800'
      case 'PENDING_VERIFICATION':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif'
      case 'SUSPENDED':
        return 'Suspendu'
      case 'BANNED':
        return 'Banni'
      case 'PENDING_VERIFICATION':
        return 'En attente'
      default:
        return status
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais'
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Surveillez et gérez les comptes utilisateurs de la plateforme
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {users?.length || 0} utilisateurs
        </Badge>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, téléphone..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="BUYER">Acheteurs</SelectItem>
                <SelectItem value="SELLER">Vendeurs</SelectItem>
                <SelectItem value="MODERATOR">Modérateurs</SelectItem>

              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ACTIVE">Actifs</SelectItem>
                <SelectItem value="SUSPENDED">Suspendus</SelectItem>
                <SelectItem value="BANNED">Bannis</SelectItem>
                <SelectItem value="PENDING_VERIFICATION">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <div className="grid gap-4">
        {users?.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* Avatar et informations de base */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.image || ''} />
                  <AvatarFallback>
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{user.name || 'Utilisateur sans nom'}</h3>
                    {user.isVerified && (
                      <UserCheck className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                  {user.location && (
                    <p className="text-sm text-muted-foreground">{user.location}</p>
                  )}
                </div>
                
                {/* Badges de rôle et statut */}
                <div className="flex flex-col gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getRoleIcon(user.role)}
                    {getRoleLabel(user.role)}
                  </Badge>
                  <Badge className={getStatusColor(user.status)}>
                    {getStatusLabel(user.status)}
                  </Badge>
                </div>
                
                {/* Statistiques */}
                <div className="text-right text-sm text-muted-foreground">
                  <div>{user._count.articles} articles</div>
                  <div>{user._count.favorites} favoris</div>
                  <div>Inscrit: {formatDate(user.createdAt)}</div>
                  <div>Dernière connexion: {formatDate(user.lastLoginAt)}</div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">
                    Voir profil
                  </Button>
                  {user.status === 'ACTIVE' ? (
                    <Button variant="outline" size="sm" className="text-yellow-600 hover:text-yellow-700">
                      <UserX className="h-4 w-4 mr-1" />
                      Suspendre
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Activer
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {(!users || users.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-muted-foreground text-center">
              Aucun utilisateur ne correspond aux critères de recherche.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}