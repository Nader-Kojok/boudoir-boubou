'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProductCard } from '@/components/custom/product-card'
import { Pagination } from '@/components/custom/pagination'
import { Heart, SortAsc } from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  description: string
  price: number
  images: string
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR'
  isAvailable: boolean
  createdAt: string
  category: {
    id: string
    name: string
  }
  seller: {
    id: string
    name: string
    whatsappNumber?: string
  }
  _count: {
    favorites: number
    reviews: number
  }
  averageRating?: number
}

interface Favorite {
  id: string
  createdAt: string
  article: Article
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Plus récent' },
  { value: 'date_asc', label: 'Plus ancien' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
]

export default function FavorisPage() {
  const { status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('date_desc')
  const [totalCount, setTotalCount] = useState(0)

  const ITEMS_PER_PAGE = 12

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/user/favorites?page=${currentPage}&limit=${ITEMS_PER_PAGE}&sortBy=${sortBy}`
      )
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des favoris')
      }
      
      const data = await response.json()
      setFavorites(data.favorites)
      setTotalPages(data.pagination.totalPages)
      setTotalCount(data.pagination.total)
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, sortBy])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchFavorites()
    }
  }, [status, router, fetchFavorites])

  const handleFavoriteToggle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/favorite`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove from favorites list
        setFavorites(prev => prev.filter(fav => fav.article.id !== articleId))
        setTotalCount(prev => prev - 1)
        
        // Recalculate total pages
        const newTotalPages = Math.ceil((totalCount - 1) / ITEMS_PER_PAGE)
        setTotalPages(newTotalPages)
        
        // If current page is now empty and not the first page, go to previous page
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error)
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

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Mes favoris
          </h1>
          <p className="text-muted-foreground mt-2">
            {totalCount > 0 ? `${totalCount} article${totalCount > 1 ? 's' : ''} en favoris` : 'Aucun favori'}
          </p>
        </div>
        
        {favorites.length > 0 && (
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Trier par" />
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
        )}
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun favori pour le moment</h3>
            <p className="text-muted-foreground mb-6">
              Explorez notre catalogue et ajoutez des articles à vos favoris pour les retrouver facilement ici.
            </p>
            <Button asChild>
              <Link href="/catalogue">
                Découvrir le catalogue
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const article = favorite.article
              const images = article.images ? JSON.parse(article.images) : []
              
              return (
                <ProductCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  description={article.description}
                  price={article.price}
                  condition={article.condition}
                  images={images}
                  category={article.category.name}
                  sellerWhatsApp={article.seller.whatsappNumber}
                  sellerName={article.seller.name}
                  isFavorite={true}
                  onFavoriteToggle={handleFavoriteToggle}
                  onWhatsAppContact={handleWhatsAppContact}
                  onClick={handleProductClick}
                  className="h-full"
                />
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}