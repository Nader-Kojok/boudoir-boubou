'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ImageGallery } from '@/components/custom/image-gallery'
import { PriceDisplay } from '@/components/custom/price-display'
import { ConditionBadge } from '@/components/custom/condition-badge'
import { ProductCard } from '@/components/custom/product-card'
import { ReviewSection } from '@/components/custom/review-section'
import { Heart, MessageCircle, Share2, MapPin, Calendar, Package, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  description: string
  price: number
  images: string
  size?: string
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
    image?: string
    location?: string
    whatsappNumber?: string
  }
  _count: {
    favorites: number
    reviews: number
  }
  averageRating?: number
}

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  reviewer: {
    id: string
    name: string
    image?: string
  }
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [similarArticles, setSimilarArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  const fetchArticle = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/articles/${id}`)
      if (!response.ok) {
        throw new Error('Article non trouvé')
      }
      const data = await response.json()
      setArticle(data.article)
      setReviews(data.reviews || [])
      setSimilarArticles(data.similarArticles || [])
    } catch (error) {
      console.error('Erreur lors du chargement de l\'article:', error)
      router.push('/catalogue')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string)
    }
  }, [params.id, fetchArticle])

  const handleFavoriteToggle = async () => {
    if (!article) return
    
    try {
      const response = await fetch(`/api/articles/${article.id}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
      })
      
      if (response.ok) {
        setIsFavorite(!isFavorite)
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error)
    }
  }

  const handleWhatsAppContact = () => {
    if (!article?.seller.whatsappNumber) return
    
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé(e) par votre article "${article.title}" sur Boudoir.`
    )
    const whatsappUrl = `https://wa.me/${article.seller.whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Erreur lors du partage:', error)
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
        <Button onClick={() => router.push('/catalogue')}>Retour au catalogue</Button>
      </div>
    )
  }

  const images: string[] = JSON.parse(article.images || '[]')

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-foreground">Catalogue</Link>
        <span>/</span>
        <Link href={`/catalogue?category=${article.category.id}`} className="hover:text-foreground">
          {article.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{article.title}</span>
      </nav>

      {/* Article principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galerie d'images */}
        <div className="space-y-4">
          <ImageGallery
            images={images}
            alt={article.title}
            showThumbnails={images.length > 1}
            showControls={images.length > 1}
            showExpandButton={true}
            className="aspect-square"
          />
        </div>

        {/* Informations de l'article */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{article.title}</h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteToggle}
                  className={cn(isFavorite && "text-red-500")}
                >
                  <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <ConditionBadge condition={article.condition} />
              <Badge variant="secondary">{article.category.name}</Badge>
              {article.size && (
                <Badge variant="outline">Taille: {article.size}</Badge>
              )}
            </div>

            <PriceDisplay price={article.price} className="text-3xl font-bold mb-4" />

            {/* Avis */}
            {article._count.reviews > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(article.averageRating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {article.averageRating?.toFixed(1)} ({article._count.reviews} avis)
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{article.description}</p>
          </div>

          <Separator />

          {/* Informations supplémentaires */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Publié le {new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{article.isAvailable ? 'Disponible' : 'Non disponible'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleWhatsAppContact}
              disabled={!article.seller.whatsappNumber || !article.isAvailable}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contacter via WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Profil du vendeur */}
      <Card>
        <CardHeader>
          <CardTitle>Profil du vendeur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={article.seller.image} />
              <AvatarFallback>
                {article.seller.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{article.seller.name}</h4>
              {article.seller.location && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{article.seller.location}</span>
                </div>
              )}
            </div>
            <Button variant="outline" asChild>
              <Link href={`/seller/${article.seller.id}`}>Voir le profil</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section des avis */}
      <ReviewSection
        articleId={article.id}
        reviews={reviews}
        averageRating={article.averageRating}
        totalReviews={article._count.reviews}
      />

      {/* Articles similaires */}
      {similarArticles.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Articles similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarArticles.map((similarArticle) => (
              <ProductCard
                key={similarArticle.id}
                id={similarArticle.id}
                title={similarArticle.title}
                description={similarArticle.description}
                price={similarArticle.price}
                condition={similarArticle.condition}
                images={typeof similarArticle.images === 'string' ? JSON.parse(similarArticle.images || '[]') : similarArticle.images}
                category={similarArticle.category.name}
                onClick={(id) => router.push(`/article/${id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}