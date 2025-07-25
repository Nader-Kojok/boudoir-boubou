'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users,
  ShoppingBag,
  Store,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { DataTable, Column, FilterConfig, Action, BulkAction } from '@/components/admin/data-table'

interface User extends Record<string, unknown> {
  id: string
  name: string | null
  phone: string | null
  image: string | null
  role: 'ADMIN' | 'BUYER' | 'SELLER'
  createdAt: string
  updatedAt: string
  phoneVerified: Date | null
  _count: {
    articles: number
    payments: number
    reviews: number
  }
}

interface UserStats {
  total: number
  byRole: {
    ADMIN: number
    BUYER: number
    SELLER: number
  }
}

interface UserManagementProps {
  className?: string
}

export function UserManagement({ className }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'SUSPEND' | 'ACTIVATE' | 'VERIFY' | 'ADD_NOTES'>('SUSPEND')
  const [actionData, setActionData] = useState({ reason: '', notes: '' })
  const [stats, setStats] = useState<UserStats | null>(null)
  const [selectedUsersForAction, setSelectedUsersForAction] = useState<User[]>([])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs')
      
      const data = await response.json()
      setUsers(data.users)
      setStats(data.stats)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleBulkAction = async (action: string, selectedRows: User[]) => {
    setSelectedUsersForAction(selectedRows)
    setActionType(action as 'SUSPEND' | 'ACTIVATE' | 'VERIFY' | 'ADD_NOTES')
    setIsActionDialogOpen(true)
  }

  const handleActionSubmit = async () => {
    if (selectedUsersForAction.length === 0) {
      toast.error('Aucun utilisateur sélectionné')
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsersForAction.map(u => u.id),
          action: actionType,
          data: actionData
        })
      })

      if (!response.ok) throw new Error('Erreur lors de l\'action')
      
      const result = await response.json()
      toast.success(result.message)
      setSelectedUsersForAction([])
      setIsActionDialogOpen(false)
      setActionData({ reason: '', notes: '' })
      fetchUsers()
    } catch {
      toast.error('Erreur lors de l\'exécution de l\'action')
    }
  }

  const handleExport = async (data: User[], filters: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/admin/users/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      })
      
      if (!response.ok) throw new Error('Erreur lors de l\'export')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Export réussi')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'export')
    }
  }



  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: 'destructive',
      SELLER: 'default',
      BUYER: 'secondary'
    } as const
    
    return (
      <Badge variant={variants[role as keyof typeof variants] || 'secondary'}>
        {role}
      </Badge>
    )
  }

  const getStatusBadge = (user: User) => {
    // TODO: Utiliser le vrai champ status après migration
    const isVerified = user.phoneVerified
    return (
      <Badge variant={isVerified ? 'default' : 'secondary'}>
        {isVerified ? 'Vérifié' : 'Non vérifié'}
      </Badge>
    )
  }

  // Configuration des colonnes pour DataTable
  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Utilisateur',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ''} />
            <AvatarFallback>
              {user.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name || 'Sans nom'}</div>
            <div className="text-sm text-muted-foreground">{user.phone}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Rôle',
      sortable: true,
      render: (value, user) => getRoleBadge(user.role)
    },
    {
      key: 'phoneVerified',
      label: 'Statut',
      render: (value, user) => getStatusBadge(user)
    },
    {
      key: 'createdAt',
      label: 'Inscription',
      sortable: true,
      render: (value, user) => new Date(user.createdAt).toLocaleDateString('fr-FR')
    },
    {
      key: 'activity',
      label: 'Activité',
      render: (value, user) => (
        <div className="text-sm">
          <div>{user?._count?.articles || 0} articles</div>
          <div>{user?._count?.payments || 0} achats</div>
          <div>{user?._count?.reviews || 0} avis</div>
        </div>
      )
    }
  ]

  // Configuration des filtres
  const filterConfigs: FilterConfig[] = [
    {
      key: 'role',
      label: 'Rôle',
      type: 'select',
      options: [
        { value: 'ALL', label: 'Tous les rôles' },
        { value: 'ADMIN', label: 'Administrateurs' },
        { value: 'SELLER', label: 'Vendeurs' },
        { value: 'BUYER', label: 'Acheteurs' }
      ]
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'ALL', label: 'Tous les statuts' },
        { value: 'VERIFIED', label: 'Vérifiés' },
        { value: 'UNVERIFIED', label: 'Non vérifiés' }
      ]
    },
    {
      key: 'search',
      label: 'Recherche',
      type: 'text',
      placeholder: 'Rechercher par nom ou téléphone...'
    }
  ]

  // Actions sur les lignes
  const actions: Action<User>[] = [
    {
      key: 'view',
      label: 'Voir le profil',
      icon: 'Eye',
      onClick: (user) => {
        // Navigation vers le profil
        console.log('Voir profil:', user.id)
      }
    },
    {
      key: 'edit',
      label: 'Modifier',
      icon: 'Edit',
      onClick: (user) => {
        // Ouvrir modal d'édition
        console.log('Modifier:', user.id)
      }
    }
  ]

  // Actions en lot
  const bulkActions: BulkAction<User>[] = [
    {
      key: 'suspend',
      label: 'Suspendre',
      onClick: (users) => handleBulkAction('SUSPEND', users),
      variant: 'destructive'
    },
    {
      key: 'activate',
      label: 'Activer',
      onClick: (users) => handleBulkAction('ACTIVATE', users),
      variant: 'default'
    },
    {
      key: 'verify',
      label: 'Vérifier',
      onClick: (users) => handleBulkAction('VERIFY', users),
      variant: 'default'
    },
    {
      key: 'notes',
      label: 'Ajouter des notes',
      onClick: (users) => handleBulkAction('ADD_NOTES', users),
      variant: 'outline'
    }
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Statistiques rapides */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Utilisateurs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Acheteurs</p>
                <p className="text-2xl font-bold">{stats.byRole.BUYER}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Store className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Vendeurs</p>
                <p className="text-2xl font-bold">{stats.byRole.SELLER}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Shield className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{stats.byRole.ADMIN}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gestion des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
          data={users}
          columns={columns}
          loading={loading}
          filters={filterConfigs}
          actions={actions}
          bulkActions={bulkActions}
          onExport={handleExport}
          onRefresh={fetchUsers}
          getRowId={(user) => user.id}
        />
        </CardContent>
      </Card>

      {/* Dialog pour les actions */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Action en lot</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {selectedUsersForAction.length} utilisateur(s) sélectionné(s)
            </div>
            
            {actionType === 'SUSPEND' && (
              <Textarea
                placeholder="Raison de la suspension..."
                value={actionData.reason}
                onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
              />
            )}
            
            {actionType === 'ADD_NOTES' && (
              <Textarea
                placeholder="Notes administratives..."
                value={actionData.notes}
                onChange={(e) => setActionData(prev => ({ ...prev, notes: e.target.value }))}
              />
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleActionSubmit}>
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}