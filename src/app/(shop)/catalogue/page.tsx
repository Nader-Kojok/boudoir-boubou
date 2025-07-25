'use client'

import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductCard } from '@/components/custom/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Search, Filter, SlidersHorizontal, Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Article {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR'
  category: {
    id: string
    name: string
  }
  seller: {
    id: string
    name: string
    image?: string
    location?: string
    whatsappNumber?: string
  }
  _count: {
    favorites: number
    reviews: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

interface CatalogueFilters {
  search: string
  categoryId: string
  minPrice: string
  maxPrice: string
  condition: string
  sortBy: string
}

const ITEMS_PER_PAGE = 12

const SORT_OPTIONS = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'popular', label: 'Popularité' },
]

const CONDITION_OPTIONS = [
  { value: 'all', label: 'Tous les états' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Bon' },
  { value: 'FAIR', label: 'Correct' },
]

function CatalogueContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  
  const [filters, setFilters] = useState<CatalogueFilters>({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('category') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || 'all',
    sortBy: searchParams.get('sort') || 'newest',
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/user/favorites')
        if (response.ok) {
          const data = await response.json()
          const favoriteIds = data.favorites.map((fav: { article: { id: string } }) => fav.article.id)
          setFavorites(favoriteIds)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error)
      }
    }
    fetchFavorites()
  }, [])

  // Fetch articles with filters
  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.categoryId && filters.categoryId !== 'all') params.append('categoryId', filters.categoryId)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.condition && filters.condition !== 'all') params.append('condition', filters.condition)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      params.append('page', currentPage.toString())
      params.append('limit', ITEMS_PER_PAGE.toString())

      const response = await fetch(`/api/articles?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
        setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.append(key, value)
    })
    
    if (currentPage > 1) params.append('page', currentPage.toString())
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/catalogue'
    router.replace(newUrl, { scroll: false })
  }, [filters, currentPage, router])

  const handleFilterChange = (key: keyof CatalogueFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: 'all',
      minPrice: '',
      maxPrice: '',
      condition: 'all',
      sortBy: 'newest',
    })
    setCurrentPage(1)
  }

  const handleFavoriteToggle = async (articleId: string) => {
    try {
      const isFavorite = favorites.includes(articleId)
      const response = await fetch(`/api/articles/${articleId}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
      })
      
      if (response.ok) {
        setFavorites(prev => 
          isFavorite 
            ? prev.filter(id => id !== articleId)
            : [...prev, articleId]
        )
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error)
    }
  }

  const handleWhatsAppContact = (articleId: string, sellerWhatsApp: string, title: string) => {
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé(e) par votre article "${title}" sur Boudoir.`
    )
    const whatsappUrl = `https://wa.me/${sellerWhatsApp}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handleProductClick = (articleId: string) => {
    router.push(`/article/${articleId}`)
  }

  const getConditionLabel = (condition: string) => {
    const option = CONDITION_OPTIONS.find(opt => opt.value === condition)
    return option?.label || condition
  }

  const activeFiltersCount = Object.entries(filters).filter(([, value]) => 
    value && value !== 'newest' && value !== 'all'
  ).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Catalogue</h1>
                <p className="text-muted-foreground mt-1">
                  Découvrez notre sélection d&apos;articles de mode
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des articles..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={cn(
            "w-80 space-y-6",
            showFilters ? "block" : "hidden lg:block"
          )}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filtres</CardTitle>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Effacer
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <Select
                    value={filters.categoryId}
                    onValueChange={(value) => handleFilterChange('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Prix (FCFA)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                  </div>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">État</label>
                  <Select
                    value={filters.condition}
                    onValueChange={(value) => handleFilterChange('condition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les états" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  'Chargement...'
                ) : (
                  `${articles.length} article${articles.length > 1 ? 's' : ''} trouvé${articles.length > 1 ? 's' : ''}`
                )}
              </div>
              
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="w-48">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    Recherche: {filters.search}
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.categoryId && filters.categoryId !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {categories.find(c => c.id === filters.categoryId)?.name}
                    <button
                      onClick={() => handleFilterChange('categoryId', 'all')}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <Badge variant="secondary" className="gap-1">
                    Prix: {filters.minPrice || '0'} - {filters.maxPrice || '∞'} FCFA
                    <button
                      onClick={() => {
                        handleFilterChange('minPrice', '')
                        handleFilterChange('maxPrice', '')
                      }}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.condition && filters.condition !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {getConditionLabel(filters.condition)}
                    <button
                      onClick={() => handleFilterChange('condition', 'all')}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Products Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg aspect-square mb-4" />
                    <div className="space-y-2">
                      <div className="bg-muted h-4 rounded" />
                      <div className="bg-muted h-4 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Aucun article trouvé</p>
                  <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                </div>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearFilters}>
                    Effacer tous les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              )}>
                {articles.map((article) => (
                  <ProductCard
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    description={article.description}
                    price={article.price}
                    condition={article.condition}
                    images={article.images}
                    category={article.category.name}
                    isFavorite={favorites.includes(article.id)}
                    sellerWhatsApp={article.seller.whatsappNumber}
                    sellerName={article.seller.name}
                    onFavoriteToggle={handleFavoriteToggle}
                    onWhatsAppContact={handleWhatsAppContact}
                    onClick={handleProductClick}
                    className={viewMode === 'list' ? 'flex-row' : ''}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Précédent
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const distance = Math.abs(page - currentPage)
                        return distance === 0 || distance === 1 || page === 1 || page === totalPages
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1]
                        const showEllipsis = prevPage && page - prevPage > 1
                        
                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        )
                      })}
                  </div>
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CataloguePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="bg-muted rounded-lg aspect-square" />
                  <div className="space-y-2">
                    <div className="bg-muted h-4 rounded" />
                    <div className="bg-muted h-4 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <CatalogueContent />
    </Suspense>
  )
}