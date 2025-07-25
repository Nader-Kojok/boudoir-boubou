'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProductCard } from '@/components/custom/product-card'
import { Pagination } from '@/components/custom/pagination'
import { MapPin, Calendar, Package, Star, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Seller {
  id: string
  name: string
  image?: string
  location?: string
  bio?: string
  whatsappNumber?: string
  createdAt: string
  _count: {
    articles: number
    reviews: number
  }
  averageRating?: number
}

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
  _count: {
    favorites: number
    reviews: number
  }
  averageRating?: number
}

export default function SellerPage() {
  const params = useParams()
  const router = useRouter()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState<'articles' | 'reviews'>('articles')

  const fetchSellerData = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sellers/${id}?page=${currentPage}&limit=12`)
      if (!response.ok) {
        throw new Error('Vendeur non trouvé')
      }
      const data = await response.json()
      setSeller(data.seller)
      setArticles(data.articles)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Erreur lors du chargement du vendeur:', error)
      router.push('/catalogue')
    } finally {
      setLoading(false)
    }
  }, [currentPage, router])

  useEffect(() => {
    if (params.id) {
      fetchSellerData(params.id as string)
    }
  }, [params.id, currentPage, fetchSellerData])

  const handleWhatsAppContact = () => {
    if (!seller?.whatsappNumber) return
    
    const message = encodeURIComponent(
      `Bonjour ${seller.name}, j'ai vu votre profil sur Boudoir et j'aimerais discuter avec vous.`
    )
    const whatsappUrl = `https://wa.me/${seller.whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-48"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Vendeur non trouvé</h1>
        <Button onClick={() => router.push('/catalogue')}>Retour au catalogue</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-foreground">Catalogue</Link>
        <span>/</span>
        <span className="text-foreground">Vendeur: {seller.name}</span>
      </nav>

      {/* Profil du vendeur */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={seller.image} />
              <AvatarFallback className="text-2xl">
                {seller.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold">{seller.name}</h1>
                {seller.location && (
                  <div className="flex items-center space-x-1 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{seller.location}</span>
                  </div>
                )}
              </div>

              {/* Statistiques */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-semibold">{seller._count.articles}</span> articles
                  </span>
                </div>
                
                {seller._count.reviews > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(seller.averageRating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm">
                      {seller.averageRating?.toFixed(1)} ({seller._count.reviews} avis)
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Membre depuis {new Date(seller.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {/* Bio */}
              {seller.bio && (
                <p className="text-muted-foreground">{seller.bio}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2">
              {seller.whatsappNumber && (
                <Button onClick={handleWhatsAppContact}>
                  <Phone className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'articles' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('articles')}
        >
          Articles ({seller._count.articles})
        </Button>
        <Button
          variant={activeTab === 'reviews' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('reviews')}
        >
          Avis ({seller._count.reviews})
        </Button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.map((article) => (
                  <ProductCard
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    description={article.description}
                    price={article.price}
                    condition={article.condition as 'EXCELLENT' | 'GOOD' | 'FAIR'}
                    images={article.images ? JSON.parse(article.images as string) : []}
                    category={article.category.name}
                    onClick={(id) => router.push(`/article/${id}`)}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucun article</h3>
              <p className="text-muted-foreground">Ce vendeur n&apos;a pas encore publié d&apos;articles.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {seller._count.reviews > 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Avis des clients</h3>
              <p className="text-muted-foreground">Fonctionnalité en cours de développement</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucun avis</h3>
              <p className="text-muted-foreground">Ce vendeur n&apos;a pas encore reçu d&apos;avis.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}