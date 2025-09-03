'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  Eye, 
  Edit,
  Trash2,
  Search,
  Plus,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ConditionBadge } from '@/components/custom/condition-badge'
import { ImageGallery } from '@/components/custom/image-gallery'
import { handleError, handleSuccess } from '@/hooks/use-notifications'
import { useConfirmation } from '@/components/ui/confirmation-dialog'
import { cacheManager, CACHE_KEYS } from '@/lib/cache-manager'

interface Article {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR'
  isAvailable: boolean
  views: number
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
  }
  status: 'ACTIVE' | 'SOLD' | 'PAUSED' | 'PENDING_MODERATION' | 'APPROVED' | 'REJECTED'
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const { confirm, ConfirmationComponent } = useConfirmation()

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      
      // Construction des paramètres de requête
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (categoryFilter !== 'all') params.append('categoryId', categoryFilter)
      if (sortBy) params.append('sortBy', sortBy)
      
      // Removed test mode functionality for security
      
      const response = await fetch(`/api/seller/articles?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des articles')
      }
      
      const data = await response.json()
      setArticles(data.articles || [])
      
    } catch (error) {
      handleError(error, 'Chargement des articles')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, categoryFilter, sortBy])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  // Les articles sont déjà filtrés et triés côté serveur
  const displayedArticles = articles

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: Article['status']) => {
    const variants = {
      ACTIVE: 'bg-green-100 text-green-800',
      SOLD: 'bg-blue-100 text-blue-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      PENDING_MODERATION: 'bg-orange-100 text-orange-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      ACTIVE: 'Actif',
      SOLD: 'Vendu',
      PAUSED: 'En pause',
      PENDING_MODERATION: 'En modération',
      APPROVED: 'Approuvé',
      REJECTED: 'Rejeté'
    }

    return (
      <Badge className={cn('text-xs', variants[status])}>
        {labels[status]}
      </Badge>
    )
  }

  const toggleArticleStatus = async (articleId: string) => {
    try {
      const article = articles.find(a => a.id === articleId)
      if (!article) return
      
      const newStatus = article.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      const newIsAvailable = newStatus === 'ACTIVE'
      
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isAvailable: newIsAvailable
        })
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut')
      }
      
      // Invalider le cache et mettre à jour l'état local
      const cacheKey = CACHE_KEYS.ARTICLES.DETAIL(articleId)
      cacheManager.delete(cacheKey)
      
      // Invalider aussi le cache de la liste d'articles
      const listCacheKey = CACHE_KEYS.USER.ARTICLES('seller')
      cacheManager.delete(listCacheKey)
      
      // Mettre à jour l'état local
      setArticles(prev => prev.map(article => {
        if (article.id === articleId) {
          return { ...article, status: newStatus, isAvailable: newIsAvailable }
        }
        return article
      }))
      
      handleSuccess(`Article ${newStatus === 'ACTIVE' ? 'activé' : 'mis en pause'} avec succès`)
      
    } catch (error) {
      handleError(error, 'Changement de statut de l\'article')
    }
  }

  const deleteArticle = async (articleId: string) => {
    const confirmed = await confirm({
      title: 'Supprimer l\'article',
      description: 'Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'destructive'
    })
    
    if (!confirmed) {
      return
    }
    
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la suppression')
      }
      
      // Invalider tous les caches liés à cet article
      const articleCacheKey = CACHE_KEYS.ARTICLES.DETAIL(articleId)
      const listCacheKey = CACHE_KEYS.USER.ARTICLES('seller')
      
      cacheManager.delete(articleCacheKey)
      cacheManager.delete(listCacheKey)
      
      // Invalider aussi le cache analytics qui pourrait contenir des données sur cet article
      cacheManager.invalidate('analytics')
      
      // Mettre à jour l'état local
      setArticles(prev => prev.filter(article => article.id !== articleId))
      handleSuccess('Article supprimé avec succès')
      
    } catch (error) {
      handleError(error, 'Suppression de l\'article')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Mes Articles</h1>
          <p className="text-gray-600 mt-1">Gérez vos articles en vente</p>
        </div>
        <Link href="/seller/vendre">
          <Button className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un article
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="sold">Vendu</SelectItem>
                <SelectItem value="paused">En pause</SelectItem>
                <SelectItem value="pending_moderation">En modération</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="Robes">Robes</SelectItem>
                <SelectItem value="Ensembles">Ensembles</SelectItem>
                <SelectItem value="Accessoires">Accessoires</SelectItem>
                <SelectItem value="Bijoux">Bijoux</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récent</SelectItem>
                <SelectItem value="price-high">Prix décroissant</SelectItem>
                <SelectItem value="price-low">Prix croissant</SelectItem>
                <SelectItem value="views">Plus de vues</SelectItem>

              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      {displayedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full gap-0 py-0">
              <Link href={`/article/${article.id}`} className="block">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <div className="absolute top-3 left-3 z-10">
                    {getStatusBadge(article.status)}
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <ConditionBadge condition={article.condition} />
                  </div>
                  {article.images && article.images.length > 0 ? (
                    <ImageGallery 
                      images={article.images}
                      alt={article.title}
                      className="w-full h-full space-y-0"
                      showControls={article.images.length > 1}
                      showThumbnails={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </Link>
              
              <CardContent className="p-4 space-y-3 px-4 flex-grow flex flex-col">
                <div>
                  <Link href={`/article/${article.id}`}>
                    <h3 className="font-semibold text-lg line-clamp-2 hover:text-boudoir-ocre-600 transition-colors cursor-pointer">{article.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{article.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{article.category.name}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-boudoir-ocre-600">
                    {article.price}F
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.views}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Créé le {formatDate(article.createdAt)}
                </div>
                
                <div className="flex gap-2 pt-2 mt-auto">
                  <Link href={`/seller/vendre?edit=${article.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleArticleStatus(article.id)}
                    className={cn(
                      article.status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'
                    )}
                  >
                    {article.status === 'ACTIVE' ? (
                      <ToggleLeft className="w-3 h-3" />
                    ) : (
                      <ToggleRight className="w-3 h-3" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteArticle(article.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                ? 'Aucun article trouvé' 
                : 'Aucun article'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par ajouter votre premier article'}
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Link href="/seller/vendre">
                <Button className="bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {displayedArticles.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          {displayedArticles.length} article{displayedArticles.length > 1 ? 's' : ''} affiché{displayedArticles.length > 1 ? 's' : ''}
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {ConfirmationComponent}
    </div>
  )
}