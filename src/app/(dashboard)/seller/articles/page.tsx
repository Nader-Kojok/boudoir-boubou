'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  Eye, 
  Heart,
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

interface Article {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR'
  isAvailable: boolean
  views: number
  favorites: number
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
  }
  status: 'ACTIVE' | 'SOLD' | 'PAUSED'
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      // Simulation de données - à remplacer par de vrais appels API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setArticles([
        {
          id: '1',
          title: 'Robe Wax Élégante Traditionnelle',
          description: 'Magnifique robe en tissu wax authentique, parfaite pour les occasions spéciales.',
          price: 85,
          images: ['/placeholder-product.jpg'],
          condition: 'EXCELLENT',
          isAvailable: true,
          views: 124,
          favorites: 8,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          category: { id: '1', name: 'Robes' },
          status: 'ACTIVE'
        },
        {
          id: '2',
          title: 'Ensemble Traditionnel Complet',
          description: 'Ensemble complet avec boubou et pantalon assorti.',
          price: 120,
          images: ['/placeholder-product.jpg'],
          condition: 'GOOD',
          isAvailable: true,
          views: 89,
          favorites: 5,
          createdAt: '2024-01-12T14:30:00Z',
          updatedAt: '2024-01-12T14:30:00Z',
          category: { id: '2', name: 'Ensembles' },
          status: 'ACTIVE'
        },
        {
          id: '3',
          title: 'Headwrap Coloré Artisanal',
          description: 'Headwrap fait main avec motifs traditionnels.',
          price: 25,
          images: ['/placeholder-product.jpg'],
          condition: 'EXCELLENT',
          isAvailable: false,
          views: 67,
          favorites: 12,
          createdAt: '2024-01-10T09:15:00Z',
          updatedAt: '2024-01-14T16:20:00Z',
          category: { id: '3', name: 'Accessoires' },
          status: 'SOLD'
        },
        {
          id: '4',
          title: 'Bijoux Traditionnels en Or',
          description: 'Collier et boucles d\'oreilles en or 18 carats.',
          price: 350,
          images: ['/placeholder-product.jpg'],
          condition: 'EXCELLENT',
          isAvailable: true,
          views: 45,
          favorites: 3,
          createdAt: '2024-01-08T11:45:00Z',
          updatedAt: '2024-01-08T11:45:00Z',
          category: { id: '4', name: 'Bijoux' },
          status: 'PAUSED'
        }
      ])
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || article.status.toLowerCase() === statusFilter
    const matchesCategory = categoryFilter === 'all' || article.category.name === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'price-high':
        return b.price - a.price
      case 'price-low':
        return a.price - b.price
      case 'views':
        return b.views - a.views
      case 'favorites':
        return b.favorites - a.favorites
      default:
        return 0
    }
  })

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
      PAUSED: 'bg-yellow-100 text-yellow-800'
    }
    
    const labels = {
      ACTIVE: 'Actif',
      SOLD: 'Vendu',
      PAUSED: 'En pause'
    }

    return (
      <Badge className={cn('text-xs', variants[status])}>
        {labels[status]}
      </Badge>
    )
  }

  const toggleArticleStatus = (articleId: string) => {
    setArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        const newStatus = article.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
        return { ...article, status: newStatus, isAvailable: newStatus === 'ACTIVE' }
      }
      return article
    }))
  }

  const deleteArticle = (articleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      setArticles(prev => prev.filter(article => article.id !== articleId))
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
          <Button className="bg-boudoir-ocre-500 hover:bg-boudoir-ocre-600">
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
                <SelectItem value="favorites">Plus de favoris</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      {sortedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 relative">
                <div className="absolute top-3 left-3 z-10">
                  {getStatusBadge(article.status)}
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <ConditionBadge condition={article.condition} />
                </div>
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{article.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{article.category.name}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-boudoir-ocre-600">
                    {article.price}€
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {article.favorites}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Créé le {formatDate(article.createdAt)}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
                  </Button>
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
                <Button className="bg-boudoir-ocre-500 hover:bg-boudoir-ocre-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {sortedArticles.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          {sortedArticles.length} article{sortedArticles.length > 1 ? 's' : ''} affiché{sortedArticles.length > 1 ? 's' : ''}
          {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && 
            ` sur ${articles.length} au total`}
        </div>
      )}
    </div>
  )
}