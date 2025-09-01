'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SearchIcon, FilterIcon, EyeIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'

interface ModerationLog {
  id: string
  action: string
  notes: string | null
  createdAt: string
  articleId: string
  moderatorId: string
  moderator: {
    id: string
    name: string
    image: string | null
  }
  article: {
    id: string
    title: string
    price: number
    images: string[]
    seller: {
      id: string
      name: string
    }
  } | null
}

interface ModerationHistoryResponse {
  logs: ModerationLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ModerationHistoryPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<ModerationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [moderatorFilter, setModeratorFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const [moderators, setModerators] = useState<Array<{id: string, name: string}>>([])

  // Charger la liste des modérateurs pour le filtre
  useEffect(() => {
    const fetchModerators = async () => {
      try {
        const response = await fetch('/api/admin/users?role=MODERATOR')
        if (response.ok) {
          const data = await response.json()
          setModerators(data.users || [])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modérateurs:', error)
      }
    }
    
    fetchModerators()
  }, [])

  // Charger l'historique
  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (actionFilter && actionFilter !== 'all') params.append('action', actionFilter)
      if (moderatorFilter && moderatorFilter !== 'all') params.append('moderatorId', moderatorFilter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`/api/admin/moderation-history?${params}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'historique')
      }
      
      const data: ModerationHistoryResponse = await response.json()
      setLogs(data.logs)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, actionFilter, moderatorFilter, startDate, endDate])

  useEffect(() => {
    fetchHistory()
  }, [currentPage, searchTerm, actionFilter, moderatorFilter, startDate, endDate, fetchHistory])

  const resetFilters = () => {
    setSearchTerm('')
    setActionFilter('all')
    setModeratorFilter('all')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'APPROVE':
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
      case 'REJECT':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
      default:
        return <Badge variant="secondary">{action}</Badge>
    }
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Accès non autorisé</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Historique des Actions de Modération</h1>
        <p className="text-gray-600">Consultez toutes les actions de modération effectuées sur les annonces</p>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher dans les notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="APPROVE">Approuvé</SelectItem>
                <SelectItem value="REJECT">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={moderatorFilter} onValueChange={setModeratorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Modérateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les modérateurs</SelectItem>
                {moderators.map((moderator) => (
                  <SelectItem key={moderator.id} value={moderator.id}>
                    {moderator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              placeholder="Date de début"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            
            <Input
              type="date"
              placeholder="Date de fin"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            
            <Button variant="outline" onClick={resetFilters}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          {total} action{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
        </p>
      </div>

      {/* Liste des logs */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchHistory} className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Aucune action de modération trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getActionBadge(log.action)}
                      <span className="text-sm text-gray-500">
                        {format(new Date(log.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={log.moderator.image || ''} />
                        <AvatarFallback>
                          {log.moderator.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{log.moderator.name}</p>
                        <p className="text-sm text-gray-500">Modérateur</p>
                      </div>
                    </div>
                    
                    {log.notes && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes :</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {log.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {log.article && (
                    <div className="ml-6 flex items-center gap-3">
                      {log.article.images && log.article.images.length > 0 && (
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                          <Image
                            src={log.article.images[0]}
                            alt={log.article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="text-right">
                        <p className="font-medium text-sm">{log.article.title}</p>
                        <p className="text-sm text-gray-500">{log.article.price}€</p>
                        <p className="text-xs text-gray-400">par {log.article.seller.name}</p>
                        <Link href={`/article/${log.article.id}`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}